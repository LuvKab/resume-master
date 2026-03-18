# One Page Resume

One Page Resume is an AI-powered resume editor focused on layout control and delivery quality. It provides local-first data storage, real-time preview, modular editing, and PDF export.

Repository: [https://github.com/LuvKab/resume-master](https://github.com/LuvKab/resume-master)

## Key Features

- Per-module height control (including avatar block)
- Drag-and-drop ordering with grid-like layout control
- AI polish and grammar checking
- Local-first storage for better privacy
- One-click PDF export for job applications

## Getting Started

```bash
pnpm install
pnpm dev
```

Default dev URL: `http://localhost:3000`

## Build and Run

```bash
pnpm build
pnpm start
```

## Tech Stack

- TanStack Start + React 18 + TypeScript
- Tailwind CSS + HeroUI
- TipTap rich text editor
- Framer Motion

## Project Structure

```text
src/
  app/                 # pages and layouts
  components/          # UI components
  routes/              # route entry points
  i18n/                # locale messages
  config/              # constants and configs
```

## Customization

- Brand/export settings: `src/config/constants.ts`
- SEO metadata: `src/routes/$locale.tsx`, `src/routes/__root.tsx`
- Landing page design: `src/app/(public)/[locale]/page.tsx`

## API Refactor (Server-Managed Mode)

You can move AI keys to the server side so users don't have to input keys in the UI.

1. Configure `.env`:
   - `VITE_SERVER_MANAGED_AI=true`
   - `DEFAULT_AI_MODEL=openai` (optional: `doubao` / `deepseek` / `gemini`)
   - model-specific `*_API_KEY`, `*_MODEL_ID`, and `OPENAI_API_ENDPOINT`
2. Client-side manual config is still supported; if request keys are missing, API routes now fall back to environment variables.

## GitHub Actions Notes

If the following Secrets are not configured, related publish/deploy jobs are now skipped instead of failing:

- Docker publish: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
- Cloudflare deploy: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

