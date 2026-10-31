# Rules — Loksewa App

Every rule has a reason. If a rule must be broken, write why in the PR/commit and tell the founder.

## 1. TypeScript & code quality

1. `strict: true`. No `any` — use `unknown` + Zod parsing instead. _(Bad data from network/DB is the #1 crash source.)_
2. No non-null `!` unless you just checked the value on the line above.
3. Functions do one thing. Files over ~200 lines get split. Components over ~150 lines get split.
4. Pure logic (scoring, timers, date conversion) lives in plain `.ts` files with unit tests — not inside components.
5. No magic numbers or strings: put them in constants (`TEST_DEFAULT_MINUTES`, `MAX_OUTBOX_TRIES`).
6. ESLint + Prettier must pass before commit. No `console.log` in committed code — use `src/lib/logger.ts`.
7. Prefer named exports. Default export only where Expo Router requires it (route files).

## 2. React Native & UI

1. Route files in `app/` only compose: get data from one feature hook, render feature components.
2. Every data screen handles **loading, empty, error, success**. Use `Skeleton`, `EmptyState`, `ErrorState` from `ui/`.
3. Long lists use `FlashList`, never `ScrollView` + `map`.
4. Use theme tokens (`colors`, `spacing`, `typography`). No hardcoded colors or sizes in components.
5. Support dark mode from day one.
6. Touch targets ≥ 48dp. Font size for questions ≥ 16, adjustable in settings (older candidates).
7. Use a proper Nepali Unicode font (bundled in `assets/fonts`). Test long Nepali text wrapping.
8. Use `React.memo`/`useCallback` only where a list item re-renders too much — don't sprinkle everywhere.
9. Animations: Reanimated only, keep them subtle. No heavy Lottie on low-end phones.

## 3. State & data

1. Server state → TanStack Query. Client state → Zustand. Offline data → SQLite repositories. Never mix.
2. Only repositories talk to SQLite. Only services/`data/remote` talk to Supabase.
3. Validate every external input with Zod: API responses, Edge Function input, pack files, CSV rows.
4. Multi-row SQLite writes use a transaction.
5. Client-generated UUIDs for attempts/reports so retries are safe (idempotent upserts).
6. Never delete unsynced user data. Outbox rows stay until confirmed.

## 4. Security (non-negotiable)

1. App bundle contains only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. **No service key, no Khalti/eSewa secret, ever.**
2. RLS enabled on every table in the same migration that creates it. Default deny.
3. Users can never insert/update `payments` or `subscriptions`. Only Edge Functions (service role).
4. Premium is unlocked only after server-side provider verification. Client "success" screens are UI only.
5. Edge Functions: verify JWT, validate input with Zod, never trust amounts or user_id from the body.
6. Auth tokens in `expo-secure-store`, not AsyncStorage.
7. `.env*` files and `content/raw/` are gitignored. Commit `.env.example` only.
8. Don't log personal data or payment secrets to Sentry/console.

## 5. Payments

1. Amounts are integers in **paisa**. Never use floats for money.
2. Create `payments` row (`pending`) before redirecting the user.
3. `provider_ref` unique; verification is idempotent (calling verify twice is safe).
4. Check status AND amount AND product/plan in the provider response.
5. Sandbox credentials until founder explicitly says "go live". Separate keys per environment.
6. Store full provider responses in `raw_response`.
7. Always offer "Check payment again" for stuck `pending` payments.

## 6. Database & migrations

1. All schema changes through `supabase/migrations/*.sql`. Never change prod schema in the dashboard.
2. Never edit a migration that has already run. Create a new one.
3. Every foreign key gets an index.
4. After a migration: regenerate `src/types/database.types.ts`.
5. Destructive changes (drop column/table) need a two-step migration and founder approval.
6. Test migrations locally (`supabase db reset`) before pushing to prod (`supabase db push`).

## 7. Content

1. All Nepali text is **Unicode**. Reject Preeti/legacy-font text in validation.
2. Every question has a `source_url` from an official or trusted source.
3. Only `checked = true` questions are imported to users.
4. Write questions in our own words. Never copy guide books, coaching notes, or other apps.
5. AI-drafted questions must be human-verified against the source before `checked = true`.
6. Facts that change (ministers, statistics, budget figures) get `date_added` and are reviewed yearly.
7. Google Sheet is the source of truth. Fix errors there, then re-import.

## 8. Performance (target: 2–3 GB RAM Android)

1. Cold start < 3s on a low-end device. Keep the root layout light; lazy-load heavy screens.
2. App download size: keep under ~30 MB. Don't bundle question packs in the app; download them.
3. Query SQLite with indexes and `LIMIT`; never load all questions into memory.
4. Images compressed (WebP). Avoid large libraries for small tasks.
5. Test every release on a real cheap Android phone, not only an emulator.

## 9. Offline & network

1. Practice and mock tests must work in airplane mode after packs are downloaded.
2. Show clear offline banners; never show raw network errors to users.
3. Large downloads: show size first and prefer Wi-Fi option in settings.
4. Retry with backoff; don't spam requests on bad networks.

## 10. Testing

1. Unit test pure logic: scoring, negative marking, timers, date conversion, Zod schemas, outbox retry.
2. Test Edge Functions locally with `supabase functions serve` and sample requests, especially payment verify.
3. Before release, run the manual checklist: sign in, guest mode, download pack, offline practice, mock test, payment (sandbox), restore after reinstall.

## 11. Git & workflow

1. Branch per change: `feat/mock-test-timer`, `fix/payment-pending`.
2. Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
3. Small commits that each work. Don't mix refactors with features.
4. Update `references/architecture.md` decisions log when a big decision changes.

## 12. Releases

1. Bump `version` (and Android `versionCode`) for every store build.
2. JS-only fixes → EAS Update to the matching channel. Native/library changes → new EAS Build.
3. Use Play Console internal testing track before production.
4. Keep a short changelog in Nepali + English for store "What's new".

## 13. Rules for the AI agent

1. Read this file before writing code; read `file-structure.md` before creating files; read `architecture.md` before data/payment/sync work.
2. Give a short plan for multi-file changes, then implement.
3. Don't add libraries without saying why and what it costs (size, maintenance).
4. Don't invent API fields for Khalti/eSewa — say "check the docs" if unsure.
5. Never weaken a security or payment rule to "make it work". Explain the right fix instead.
6. Explain new concepts simply; the founder is learning.
7. After changes, list commands the founder must run.
