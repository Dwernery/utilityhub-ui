# Project SHIELD (UtilityHub web)

The web app for UtilityHub: Library, MCU tracker and Finances. `utility-hub-mobile` is the iOS version of the same app, and the two are kept in step.

- **Stack:** React, Vite, Tailwind CSS, TanStack Query, Recharts.
- **Backend:** `platform-api` (Spring Boot), reached at `/api`.

## Setup

```bash
npm install
```

In development, Vite forwards `/api` to the API at `http://localhost:8080`. To use another address, set `VITE_API_URL` in a git-ignored `.env`. The app and the API need to share an address, because the session cookie only works that way (see `src/lib/config.js`).

## Run

```bash
npm run dev       # http://localhost:5173, with the API running
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

`platform-api/scripts/deploy.sh` builds this app on the server and publishes it.

## Checks

```bash
npm run lint && npm run format:check && npm test && npm run build
```

## Layout

- `src/domains/<domain>/`: pages, components, `api.js`, TanStack Query `hooks.js` and pure `utils/` per domain (`finance`, `library`, `mcu`, `home`)
- `src/components/`: shared UI
- `src/lib/`: config, HTTP, sign-in session and date helpers
- `src/domains/finance/utils/shared-cases.json`: test cases the mobile app runs too, so the two can't drift
