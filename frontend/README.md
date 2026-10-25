# UPSC Desk – Frontend

React 18 + TypeScript + Vite. The FastAPI backend is a separate project.

## Run
```bash
cp .env.example .env      # set VITE_API_BASE_URL and VITE_GOOGLE_CLIENT_ID
npm install
npm run dev               # http://localhost:5173
npm run build             # type-check + production build in dist/
docker build -t upsc-desk --build-arg VITE_API_BASE_URL=https://api.example.com .
```

## Backend contract
| Endpoint | Body | Response |
|---|---|---|
| `POST /auth/login` | `{email, password}` | `{access_token, user:{name,email}}` |
| `POST /auth/register` | `{name, email, password}` | same |
| `POST /auth/google` | `{credential}` (Google ID token) | same |
| `POST /chat` | `{message, subject, history:[{role,content}]}` + `Authorization: Bearer` | JSON `{reply}` or streamed `text/plain` |

Errors: return `{"detail": "message"}` with a 4xx status; the UI shows `detail`. A 401 on an authenticated call logs the user out.

## Backend checklist
- Enable CORS for the frontend origin (`allow_headers=["Authorization","Content-Type"]`).
- Verify the Google ID token server-side (`google-auth`) and check `aud` equals your client ID.
- Stream with `StreamingResponse(..., media_type="text/plain")`.

## Structure
`src/api` HTTP client and endpoints · `src/auth` session context · `src/hooks/useChat.ts` chat state, streaming, persistence · `src/components` UI · `src/pages` routes.

## Security notes
- The token is kept in `sessionStorage` (cleared when the tab closes). For stronger protection, issue an httpOnly SameSite cookie from FastAPI and add `credentials: 'include'` in `src/api/client.ts`.
- Assistant output is rendered with `react-markdown`, which does not execute raw HTML.
- Set a Content-Security-Policy at your host allowing `https://accounts.google.com` and your API origin.
- Chat history is stored in the browser only; clear it on shared devices.

