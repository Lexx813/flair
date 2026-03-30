---
name: Vercel Deployment & Auth Architecture
description: How auth, API proxying, and Vercel deployment work for flair-dashboard
type: project
---

Deployed at https://flair-dashboard-lac.vercel.app via Vercel (GitHub integration auto-deploys on push to main).

## Auth architecture
- `api/token.js` — Vercel serverless function that exchanges credentials server-side and returns the access token
- Client calls `/api/token` (prod) or `/oauth2/token` via Vite proxy (dev)
- Dev/prod split in `src/api/flairClient.js`: if `import.meta.env.VITE_FLAIR_CLIENT_ID` is set → dev path, else → prod serverless function

## Vercel env vars
- `FLAIR_CLIENT_ID` / `FLAIR_CLIENT_SECRET` — production only, used by serverless function (server-side, never in bundle)
- `VITE_FLAIR_CLIENT_ID` / `VITE_FLAIR_CLIENT_SECRET` — in `.env` for local dev ONLY, must NOT be set in Vercel production (bakes into bundle and breaks prod auth)

## API proxy
- `vercel.json`: `/flair/:path*` → `https://api.flair.co/:path*` (strips /flair prefix)
- `vite.config.js`: `/flair` → `https://api.flair.co` (strips /flair), `/oauth2` → `https://api.flair.co/oauth2` for dev token exchange
- `apiFetch()` calls `/flair/api${path}` which maps to `https://api.flair.co/api${path}`

**Why:** VITE_ vars get baked into the JS bundle at build time. If set in Vercel production, the prod bundle enters dev mode and calls /oauth2/token which has no rewrite → 404.
