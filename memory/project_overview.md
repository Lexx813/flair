---
name: Flair Dashboard Project Overview
description: What the project is, its purpose, tech stack, and architecture
type: project
---

Flair Dashboard is a smart home HVAC control web app that integrates with the Flair smart home API to manage climate control across multiple buildings (structures), rooms, vents, and HVAC units in real time.

**Why:** Personal/internal tool for monitoring and controlling Flair smart home devices via a custom dashboard UI.

**Tech Stack:**
- React 19 + Vite 8 (Oxc compiler via @vitejs/plugin-react)
- Tailwind CSS 4 (utility-first, dark theme)
- TanStack React Query 5 (server state, caching, 30s stale time)
- Lucide React (icons)
- Fira Code (monospace, for temps/data) + Fira Sans (body)

**Key Source Dirs:**
- `src/api/flairClient.js` — Flair API client, OAuth2 client credentials, all CRUD ops
- `src/hooks/useFlair.js` — TanStack Query hooks wrapping all API endpoints
- `src/components/` — all UI components (PascalCase .jsx)
- `design-system/flair-dashboard/MASTER.md` — canonical design system (colors, typography, tokens)

**API Integration:**
- Vite proxy: `/oauth2/*` and `/api/*` → `https://api.flair.co`
- OAuth2 token cached in memory with auto-refresh (60s buffer before expiry)
- JSON:API format (data/type/id/attributes)
- Credentials in `.env` as `VITE_FLAIR_CLIENT_ID` / `VITE_FLAIR_CLIENT_SECRET`

**How to apply:** All API work flows through `flairClient.js`; all data fetching through `useFlair.js` hooks. Design decisions should reference `MASTER.md`.
