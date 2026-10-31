---
name: loksewa-app
description: Senior-level engineering guide for the Loksewa exam-prep mobile app (React Native + Expo + TypeScript + Supabase + SQLite offline + Khalti/eSewa payments). Use this skill for ANY work in this project — creating or editing screens, components, hooks, stores, database tables, migrations, RLS policies, Edge Functions, payment flows, offline sync, question import scripts, mock tests, subscriptions, or release builds — even if the request is small ("add a button", "fix this bug", "make a new table") and even if the user does not mention the skill. Also use it when the user asks where a file should go, how a feature should be structured, or whether something follows the project rules.
---

# Loksewa App — Engineering Skill

You are working as a senior engineer on a solo-founder product: a Loksewa (Nepal Public
Service Commission) exam-prep app. The founder is still learning, so code must be
**simple, consistent, and explained**. Prefer boring, proven patterns over clever ones.

## Reference files (read before acting)

| When you are about to...                                              | Read                                  |
| --------------------------------------------------------------------- | ------------------------------------- |
| Write or change ANY code                                              | `references/rules.md` (always, first) |
| Create a new file or folder, or move code                             | `references/file-structure.md`        |
| Touch data flow, database, sync, auth, payments, or add a new feature | `references/architecture.md`          |

Do not skip these. They contain decisions that are already made — do not re-decide them.

## Stack (fixed — do not swap without the founder asking)

- **App:** React Native + Expo (managed), Expo Router, TypeScript strict
- **State:** Zustand (client/UI state), TanStack Query (server state)
- **Local DB:** expo-sqlite (offline question packs, attempts, outbox)
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions, RLS)
- **Payments:** Khalti ePayment + eSewa ePay v2, verified ONLY in Edge Functions
- **Validation:** Zod at every boundary (API input, imported data, local DB rows)
- **Lists:** @shopify/flash-list for long lists
- **Errors:** Sentry; **Build/Release:** EAS Build + EAS Update

## Non-negotiables (summary — full list in rules.md)

1. **Never unlock premium on the client.** Only `payments-verify` Edge Function writes subscriptions.
2. **No secrets in the app.** The app holds only the Supabase URL + anon key. Khalti/eSewa secrets live in Edge Function env.
3. **RLS on every table.** A table without RLS policies is a bug.
4. **Schema changes = SQL migration files** in `supabase/migrations/`. Never edit the schema in the dashboard.
5. **Offline-first for content.** Practice and mock tests must work with no internet after a pack is downloaded.
6. **Screens are thin.** Logic lives in `src/features/<feature>/` hooks and services, not in `app/` route files.
7. **Content is Unicode Nepali**, never Preeti. Only questions with `checked = true` reach users.
8. **Must run smoothly on a 2–3 GB RAM Android phone.**

## Standard workflows

### Add a new screen

1. Route file in `app/` (thin: layout + calls one feature hook).
2. UI pieces in `src/features/<feature>/components/`.
3. Logic in `src/features/<feature>/hooks/`.
4. Shared primitives only from `src/components/ui/`.
5. Handle 4 states: loading, empty, error, success.

### Add or change a database table

1. Write `supabase/migrations/<timestamp>_<name>.sql` (table + indexes + RLS + policies in the same file).
2. Regenerate types: `npx supabase gen types typescript --local > src/types/database.types.ts`.
3. If the table is used offline, add a matching local migration in `src/data/local/migrations/` and a repository.
4. Explain the change and its RLS policy to the founder in plain words.

### Add an Edge Function

1. Folder `supabase/functions/<kebab-name>/index.ts`; shared code in `_shared/`.
2. Validate input with Zod, check auth (`getUser` from the JWT), return typed JSON `{ ok, data | error }`.
3. Use the service-role client only inside functions, never in the app.
4. Make it idempotent if it writes money or entitlement data.

### Work with payments

Read the payment section of `references/architecture.md` fully every time. Always use
sandbox/test credentials until the founder says "go live". Amounts are stored in **paisa (integer)**.

### Add questions / content tooling

Questions come from Google Sheet → CSV → `scripts/import-questions.ts` (Zod-validated) →
Supabase → `scripts/build-packs.ts` → versioned JSON packs in Storage. Never hand-insert
questions into production.

## How to respond to the founder

- Before a big change, give a short plan (files to create/edit, why) and then do it.
- After the change, list what changed and any command they must run (migrations, type gen, restart).
- Explain any new concept in 1–2 simple sentences. English is their second language: short sentences, no slang.
- If a request breaks a rule in `rules.md`, say which rule, and offer the correct way.
- Do not add a new library unless it clearly saves time; say why when you do.
