# Architecture — Loksewa App

## Contents

1. Big picture
2. App layers
3. Data model (Supabase)
4. Security model (RLS + entitlements)
5. Offline-first content (packs)
6. Attempts & sync (outbox)
7. Authentication
8. Payments (Khalti + eSewa)
9. Content pipeline
10. Environments, observability, releases
11. Decisions log (do not re-decide)

---

## 1. Big picture

```
 Google Sheet (questions)
        │ export CSV
        ▼
 scripts/import-questions.ts ──(Zod validate)──► Supabase Postgres
                                                     │
 scripts/build-packs.ts ◄────────────────────────────┘
        │ versioned JSON packs
        ▼
 Supabase Storage (bucket: packs, private)
        │ signed URL (Edge Fn: get-pack-url, checks entitlement)
        ▼
 ┌────────────────── Expo App ───────────────────┐
 │ UI (app/ routes) → features (hooks/stores)    │
 │        → data/repositories                    │
 │        → SQLite (offline)  |  Supabase (online)│
 └───────────────────────────────────────────────┘
        │ payments-initiate / payments-verify
        ▼
 Khalti ePayment  /  eSewa ePay v2
```

Core idea: **content is downloaded once and used offline; money and entitlement logic
only ever runs on the server.**

## 2. App layers

Dependencies point downward only. A layer never imports from a layer above it.

| Layer    | Folder                                                                 | Responsibility                                               | May import                      |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| Routes   | `app/`                                                                 | Navigation, layout, call one feature hook                    | features, components/ui         |
| Features | `src/features/*`                                                       | Screens' components, hooks, Zustand stores, feature services | data, components/ui, lib, types |
| Data     | `src/data/*`                                                           | Repositories (local + remote), sync engine                   | lib, types, config              |
| Shared   | `src/components/ui`, `src/lib`, `src/theme`, `src/types`, `src/config` | Primitives, helpers                                          | nothing above                   |

State rules:

- **Server state** (profile, subscription status, current affairs list) → TanStack Query.
- **Client/UI state** (active test session, timer, selected answers) → Zustand store in the feature.
- **Persistent offline data** (questions, attempts, outbox) → SQLite via repositories.
- Never duplicate the same data in two state systems.

## 3. Data model (Supabase / Postgres)

All ids are `uuid` (default `gen_random_uuid()`), all tables have `created_at timestamptz default now()`.

**Catalog**

- `posts` — exam post (Kharidar, Nayab Subba…): `id, slug, name_ne, name_en, level, sort_order, is_active`
- `papers` — `id, post_id → posts, name_ne, name_en, full_marks, duration_min, sort_order`
- `topics` — syllabus topics: `id, paper_id → papers, parent_id → topics (nullable), name_ne, name_en, sort_order`

**Content**

- `questions` — `id, topic_id → topics, body_ne, options jsonb (array of 4 strings), correct_index smallint (0–3), explanation_ne, source_url, difficulty smallint, is_premium bool, checked bool, content_hash text unique, version int, updated_at`
- `mock_tests` — `id, paper_id, title_ne, duration_min, negative_marking numeric, is_premium, published_at`
- `mock_test_questions` — `mock_test_id, question_id, position` (PK on mock_test_id + position)
- `current_affairs` — `id, title_ne, body_ne, source_url, published_on date, is_premium`
- `question_packs` — `id, paper_id, kind ('free'|'premium'), version int, storage_path, question_count, checksum, published_at`

**Users & money**

- `profiles` — `id = auth.users.id, display_name, target_post_id, created_at`
- `plans` — `id, code ('monthly'|'yearly'), price_paisa int, duration_days int, is_active`
- `payments` — `id, user_id, plan_id, provider ('khalti'|'esewa'), amount_paisa, status ('pending'|'completed'|'failed'|'refunded'), provider_ref text unique (pidx / transaction_uuid), raw_response jsonb, verified_at`
- `subscriptions` — `id, user_id, plan_id, payment_id unique, starts_at, ends_at`

**Learning & feedback**

- `attempts` — `id (client-generated uuid), user_id, mock_test_id nullable, mode ('practice'|'mock'), started_at, finished_at, score numeric, correct int, wrong int, skipped int`
- `attempt_answers` — `attempt_id, question_id, chosen_index nullable, is_correct, time_ms`
- `question_reports` — `id, user_id, question_id, reason, note, status ('open'|'fixed'|'rejected')`

Indexes: every foreign key; `questions(topic_id, checked)`; `subscriptions(user_id, ends_at)`;
`attempts(user_id, started_at desc)`.

## 4. Security model

- **RLS enabled on every table.** Default deny.
- Catalog tables (`posts`, `papers`, `topics`, `plans`): readable by everyone.
- `questions`, `mock_tests`, `current_affairs`: readable when `checked = true` (questions) AND
  (`is_premium = false` OR `public.has_active_subscription(auth.uid())`).
- `profiles`, `attempts`, `attempt_answers`, `question_reports`: user can read/write only own rows.
- `payments`, `subscriptions`: user can **read own rows only**. No insert/update policies for users.
  Only the service role (Edge Functions) writes them.

```sql
create or replace function public.has_active_subscription(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from subscriptions s
    where s.user_id = uid and now() between s.starts_at and s.ends_at
  );
$$;
```

The app reads entitlement from a view or RPC (`get_my_entitlement()` → `{ is_premium, ends_at }`)
and caches it locally with a timestamp. Cached premium status is a UI hint only — the
server (RLS + `get-pack-url`) is the real gate.

## 5. Offline-first content (packs)

- `scripts/build-packs.ts` creates one JSON pack per paper per kind (`free`, `premium`),
  gzip-compressed, with `version` and `checksum`, uploaded to private bucket `packs`.
- App asks `get-pack-url` (Edge Function) for packs it is allowed to have → gets short-lived signed URLs.
- App downloads, verifies checksum, writes to SQLite in **one transaction**, records `pack_version`.
- On app start (and pull-to-refresh), compare local versions with `question_packs`; download only changed packs.
- If subscription expires, premium packs stay on the device but premium content is hidden by
  a local check against cached `ends_at`. (Acceptable trade-off: we cannot delete data from a phone reliably.)

Local SQLite tables mirror only what the app needs: `questions`, `topics`, `papers`, `mock_tests`,
`mock_test_questions`, `packs`, `attempts`, `attempt_answers`, `outbox`, `meta`.

## 6. Attempts & sync (outbox pattern)

1. A practice session or mock test is saved to SQLite immediately (never lose a user's work).
2. On finish, a row is written to `outbox` (`id, kind, payload json, tries, last_error`).
3. `src/data/sync/outbox.ts` flushes when online (app foreground + network change), using
   `upsert` with the client-generated `attempts.id`, so retries never create duplicates.
4. After 5 failed tries, keep the row and log to Sentry; do not drop user data.

## 7. Authentication

- Start with **email OTP (magic code)** and **Google Sign-In** via Supabase Auth — no SMS cost.
- Phone OTP (Nepali SMS provider, e.g. via a Supabase Auth SMS hook) only later, when revenue allows.
- Allow **guest mode** for free practice; require login only for payment and cloud progress.
  When a guest logs in, attach their local attempts to the new user (outbox payloads get the user_id).
- Session stored with `expo-secure-store` adapter for Supabase Auth.

## 8. Payments (Khalti + eSewa)

Always confirm current endpoints and field names in the official Khalti and eSewa developer
docs before coding; use sandbox credentials until the founder says go live.

### Golden rules

- Prices come from the `plans` table on the server. **Never trust an amount sent by the app.**
- Every payment gets a `payments` row with status `pending` **before** redirecting the user.
- `provider_ref` is `unique` → the same payment can never create two subscriptions.
- Verification = server-to-server lookup with the provider. A redirect URL alone proves nothing.
- Subscription extension: `starts_at = greatest(now(), current ends_at)`; `ends_at = starts_at + duration_days`.
- Verification + subscription insert happen in one DB transaction (Postgres function `complete_payment(...)` called by the Edge Function).

### Khalti (ePayment)

```
App ──► payments-initiate {plan_code, provider:'khalti'}
         server: load plan, insert payments(pending), call Khalti initiate (secret key)
         ◄── { payment_url, pidx }
App opens payment_url (expo-web-browser openAuthSessionAsync) with return_url = app deep link
App ◄── deep link back with pidx
App ──► payments-verify {provider:'khalti', pidx}
         server: Khalti lookup(pidx) → status Completed AND amount == plan price
         → complete_payment() → subscription
         ◄── { ok, entitlement }
App invalidates entitlement query, downloads premium packs
```

### eSewa (ePay v2)

```
App ──► payments-initiate {plan_code, provider:'esewa'}
         server: insert payments(pending) with transaction_uuid,
                 build signed form fields (HMAC-SHA256 with secret key)
         ◄── { form_url, fields }
App renders an auto-submitting form inside react-native-webview,
    watches navigation for success_url / failure_url
App ──► payments-verify {provider:'esewa', transaction_uuid}
         server: eSewa status-check API → COMPLETE AND amount matches → complete_payment()
```

### Failure handling

- User closes the browser → payment stays `pending`; app offers "I already paid — check again" which calls `payments-verify`.
- A scheduled job (pg_cron or a cron-triggered Edge Function) re-verifies `pending` payments older than 10 minutes.
- Log every provider response in `payments.raw_response` for disputes.

## 9. Content pipeline

1. Founder writes questions in Google Sheet with columns:
   `question | option_a | option_b | option_c | option_d | answer (A–D) | explanation | topic_slug | source_url | difficulty | is_premium | checked | date_added`
2. Export CSV → `content/raw/*.csv` (not committed if private).
3. `npm run content:validate` — Zod checks: 4 non-empty distinct options, valid answer, topic exists,
   source_url present, Unicode Nepali (reject Preeti-like ASCII patterns), no duplicate `content_hash`.
4. `npm run content:import` — upserts by `content_hash` into Supabase (service key from local `.env`, never committed).
5. `npm run content:packs` — builds and uploads packs, bumps versions.
6. `question_reports` with status `open` are reviewed weekly; fixes go back into the Sheet (Sheet is the source of truth).

## 10. Environments, observability, releases

- Two Supabase projects: `loksewa-dev` and `loksewa-prod`. Local dev with `supabase start`.
- `app.config.ts` reads `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_ENV`.
- EAS profiles: `development` (dev client), `preview` (internal APK), `production` (AAB for Play Store).
- EAS Update channels match profiles. JS-only fixes → EAS Update; native changes → new build.
- Sentry for crashes (app + Edge Functions). Basic analytics events: `pack_downloaded`, `test_started`,
  `test_finished`, `paywall_viewed`, `payment_started`, `payment_completed`.

## 11. Decisions log (do not re-decide)

| Decision                              | Reason                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| Supabase over Firebase                | Relational data fits SQL; RLS; free tier without international card for functions |
| expo-sqlite for offline               | Large question sets, SQL queries, transactions                                    |
| Zustand + TanStack Query              | Small, simple; clear split between client and server state                        |
| Packs instead of per-question fetch   | Saves user data, works offline, fewer API calls                                   |
| Payment verification server-side only | Prevent fake unlocks                                                              |
| Email OTP + Google before phone OTP   | No SMS cost at launch                                                             |
| Android first, iOS later              | Market share in Nepal; Apple fee                                                  |
