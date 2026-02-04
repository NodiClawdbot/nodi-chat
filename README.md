# nodi-chat

Authenticated chat UI (text now, PTT/live later).

## Features (current)
- Google login (NextAuth)
- Allowlist via `ALLOWED_EMAILS`
- `/chat` UI + `/api/chat` endpoint (placeholder reply for now)

## Dev
```bash
npm install
npm run dev
```

## Deploy (Cloud Run)
```bash
PROJECT_ID=lisemark-ai-lab ./scripts/deploy_cloudrun.sh
```
