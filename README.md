# NeuroSense AI

Futuristic biomedical dashboard for real-time tremor monitoring and AI-powered classification.

## Tech stack

- React 19 + TypeScript
- TanStack Start / TanStack Router (file-based routing)
- Tailwind CSS v4
- Framer Motion (animations)
- Recharts (charts)
- React Icons

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:8080.

## Build

```bash
npm run build
```

Outputs:
- `dist/client/` — static client assets
- `dist/server/server.js` — SSR fetch handler

## Deploy to Vercel

This repo is pre-configured for Vercel:

- `vercel.json` sets the build command, static output directory and routes all
  non-asset requests through `/api`.
- `api/index.ts` is a Vercel Node serverless function that wraps the
  TanStack Start SSR handler (`dist/server/server.js`).

Steps:

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Import the project in Vercel — leave framework as "Other" (vercel.json takes over).
3. Deploy.

No environment variables are required.
