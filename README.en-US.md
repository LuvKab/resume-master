# One Page Resume

A local-first AI resume editor focused on:

1. Modular editing (drag/sort/height control)
2. One-page layout control (preview/export consistency)
3. AI polish + grammar check (official, gateway, and local OpenAI-compatible providers)

- Repository: https://github.com/LuvKab/resume-master
- Stack: TanStack Start + React 18 + TypeScript + Tailwind + TipTap

## 1. Prerequisites

### 1.1 Required versions

- Node.js: `>= 20`
- pnpm: `>= 10`

### 1.2 Check with commands

```bash
node -v
pnpm -v
```

If either command fails or the version is too old, upgrade first.

## 2. Run Locally (step by step)

### Step 1: install dependencies

```bash
pnpm install
```

Expected result: no `ERR!` / `ELIFECYCLE` failure in terminal.

### Step 2: start dev server

```bash
pnpm dev
```

Expected result: terminal prints a local URL (for example `http://localhost:3000` or `http://localhost:5173`).

### Step 3: open browser

Open the printed URL, then click **Start** on the landing page.  
It should go directly to:

- `/app/dashboard/resumes`

## 3. First-time Flow (short path)

1. In **My Resumes**, click **New Resume**.
2. Choose blank/template.
3. It opens editor directly (`/app/workbench/{id}`).
4. Edit content and export PDF.

## 4. AI Configuration (manual mode by default)

Path: `Dashboard -> AI Providers`

### 4.1 What you will see

1. Left panel always shows all providers (DeepSeek / Doubao / OpenAI / Gemini / Qwen / Zhipu / Kimi / SiliconFlow / Ollama / LM Studio / Custom Proxy).
2. Clicking a provider switches the right-side form to that provider.
3. “Current viewing provider” and “default selected model” are separate states.

### 4.2 Important rules

1. All API input fields default to empty.
2. Ollama / LM Studio / Custom Proxy show a **Base URL** input.
3. Only **Custom Proxy** requires manual **Model ID** input; all other providers use built-in defaults.
4. Ollama / LM Studio allow empty API key (no Authorization header when empty).

## 5. Production Build & Run

```bash
pnpm build
pnpm start
```

Expected result: app starts and is reachable.

## 6. Deploy on Vercel (SSR + API)

This repository now uses `TanStack Start + Nitro`, so it can be deployed directly on Vercel Node Runtime (not Edge).

### 6.1 Vercel project settings

- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: leave empty (Nitro output is auto-detected)
- Node.js Version: `20.x`

### 6.2 Key environment variables

```env
# Optional: compatibility PDF channel (defaults to built-in URL when omitted)
VITE_PDF_REMOTE_SERVER_URL=https://api.yijianli.app/generate-pdf

# Optional: server-managed AI mode
VITE_SERVER_MANAGED_AI=true
DEFAULT_AI_MODEL=openai
OPENAI_API_KEY=...
OPENAI_MODEL_ID=...
OPENAI_API_ENDPOINT=...
```

### 6.3 Expected PDF behavior on Vercel

1. `/api/pdf` returns `503` with `PDF_LOCAL_DISABLED_ON_VERCEL` (expected degrade, not an outage).
2. Frontend export automatically continues with compatibility channel; if that also fails, use browser print fallback.
3. Local development and self-hosted runtime use compatibility export by default. Install `puppeteer` only if you want to re-enable local `/api/pdf` export.

## 7. Common Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local development |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm preview` | Preview build output |
| `pnpm generate:template-snapshots` | Regenerate template snapshots |

## 8. Troubleshooting

### 7.1 Port already in use

Symptom: `pnpm dev` reports port conflict.  
Fix: stop the process using that port, or use the new port printed by terminal.

### 7.2 Dependency install fails

Symptom: `pnpm install` fails because of cache/network/lock issues.  
Fix:

```bash
pnpm store prune
pnpm install
```

### 7.3 AI request fails (401/403)

Check in order:

1. API key is correct.
2. Endpoint is reachable.
3. For Custom Proxy, Model ID is set correctly.

### 7.4 Local runtime not responding (Ollama/LM Studio)

Check in order:

1. Local service is running.
2. Endpoint is correct (for example `http://127.0.0.1:11434/v1`).
3. API key can be left empty by default.

## 9. Optional: Server-managed AI

If you do not want users to input keys in UI:

```env
VITE_SERVER_MANAGED_AI=true
DEFAULT_AI_MODEL=openai
OPENAI_API_KEY=...
OPENAI_MODEL_ID=...
OPENAI_API_ENDPOINT=...
```

`doubao` / `deepseek` / `gemini` env variants are also supported.

## 10. Project Structure

```text
src/
  app/         pages and layouts
  components/  components
  routes/      routes and APIs
  store/       Zustand stores
  config/      constants and config
  i18n/        locale messages
```
