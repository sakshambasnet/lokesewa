# Loksewa App

Loksewa (PSC Nepal) exam preparation app — Android first.

## Setup

1. Install Node 20+ and run `npm install`.
2. Copy `.env.example` to `.env` and fill in the Supabase URL and anon key.
3. Start the app: `npm start`, then press `a` for Android.

Some libraries (expo-sqlite, expo-secure-store) work in Expo Go, but payments and Sentry will
later need a development build: `npx eas-cli@latest build --profile development --platform android`.

## Scripts

| Command             | What it does                            |
| ------------------- | --------------------------------------- |
| `npm start`         | Start the Expo dev server               |
| `npm run typecheck` | TypeScript check                        |
| `npm run lint`      | ESLint                                  |
| `npm test`          | Unit tests (Jest)                       |
| `npm run check`     | All three above — run before committing |
| `npm run format`    | Format all files with Prettier          |

## Structure

See `.claude/skills/loksewa-app/references/file-structure.md`. Short version:

- `app/` — routes only (thin)
- `src/features/` — one folder per feature (components, hooks, store, service)
- `src/data/` — SQLite (local) and Supabase (remote) access
- `src/components/ui/` — shared UI primitives
- `supabase/` — SQL migrations and Edge Functions
