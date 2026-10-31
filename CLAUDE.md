# Loksewa App

Exam-prep app for Nepal Public Service Commission (Loksewa) candidates.
React Native + Expo (SDK 58, Expo Router) + TypeScript strict + Supabase + expo-sqlite (offline) + Khalti/eSewa.

**Always use the `loksewa-app` skill** (`.claude/skills/loksewa-app/`) for any work in this repo.
Read its `references/rules.md` before writing code.

## Expo note

Expo changes every SDK. Before using an Expo/React Native API, check the docs for the SDK in
`package.json`: https://docs.expo.dev/versions/v58.0.0/ (index: https://docs.expo.dev/llms.txt).
Install packages with `npx expo install <pkg>`, never plain `npm install <pkg>`.

## Commands

- `npm start` — dev server
- `npm run check` — typecheck + lint + tests (run before every commit)
- `npm run format` — Prettier
