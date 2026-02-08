# nodi-chat — CONTEXT

## Mål
- Bygga en enkel, autentiserad chat-UI för Nodi (text först; röst/PTT kan komma senare).
- Säker inloggning (Google/NextAuth) + enkel allowlist.
- Backend: `/api/chat` som proxar mot OpenAI Responses.

## Scope (ingår/ingår inte)
- Ingår:
  - Next.js-app med `/chat` UI.
  - Google-login (NextAuth) + allowlist via `ALLOWED_EMAILS`.
  - `/api/chat` endpoint: tar `message` + `model` (allowlistad) och returnerar svar.
  - Cloud Run-deploy (container) + secrets för OpenAI + NextAuth.
- Ingår inte (just nu):
  - Persistens av chat-historik (ingen DB än).
  - Multi-user/admin UI.
  - PTT/live audio (se separat projekt `nodi-ptt`).

## Status
**Senast känt (infra):**
- Cloud Run service: `nodi-chat` (region `europe-north1`).
- Image: `europe-north1-docker.pkg.dev/lisemark-ai-lab/nodi-chat/nodi-chat:latest`.
- URL: `https://nodi-chat-5ntmtfrjua-lz.a.run.app` (primary) + `https://nodi-chat-76569202692.europe-north1.run.app`.
- Auth:
  - `NEXTAUTH_URL` satt till Cloud Run-URL.
  - `ALLOWED_EMAILS` innehåller `j.lisemark@gmail.com`.
  - Secrets: `nodi_chat_google_client_secret`, `nodi_chat_nextauth_secret`, `nodi_chat_openai_api_key`.

**Kod-läge:**
- Middleware skyddar allt utom `/`, `/_next`, `/api/auth/*`, `favicon`.
- `/api/chat` kräver server-session och använder OpenAI Responses.

**Nästa steg (förslag):**
- Bestäm om vi ska lägga till historik (t.ex. SQLite/Firestore) eller hålla stateless.
- Förbättra prompt/verktyg (t.ex. "local-tools" med begränsade åtgärder).
- Finjustera auth/allowlist (flera mail, domän, etc.).

## Viktiga filer/paths
- Kod: `/Users/johanlisemark/clawd/projects/nodi-chat/`
- Deploy-script: `projects/nodi-chat/scripts/deploy_cloudrun.sh`

## Kommandon
- Dev:
  - `npm install`
  - `npm run dev`
- Deploy:
  - `cd /Users/johanlisemark/clawd/projects/nodi-chat`
  - `PROJECT_ID=lisemark-ai-lab ./scripts/deploy_cloudrun.sh`

## Länkar
- Cloud Run (primary): https://nodi-chat-5ntmtfrjua-lz.a.run.app
