# ai-hotkey dashboard (Next.js)

A read-only view of every answer the desktop hotkey has produced, stored in
Supabase and deployed to Vercel so you can read it from your phone.

```
laptop                                supabase            vercel
hotkey.ahk ──▶ server.py ──POST──▶  answers table ◀─GET─  /api/answers ◀─ your phone
```

The desktop side never talks to Vercel, and Vercel never talks to the desktop.
Supabase is the only thing they share.

---

## 1. Create the table

1. Make a project at <https://supabase.com> (free tier is plenty).
2. Open **SQL Editor → New query**.
3. Paste in [`supabase/schema.sql`](../supabase/schema.sql) and run it.

That creates `public.answers`, indexes it, and enables RLS with **no policies** -
so the public anon key can never read a row.

---

## 2. Tell the laptop to write there

From **Project Settings → API**, copy the Project URL and the **service_role**
key into `ai-hotkey/.env`:

```ini
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

Restart the desktop server. `server.log` should now say
`storing answers in supabase: https://...`.

If Supabase is unreachable the server keeps working and writes to
`history.json` instead - your answers are never dropped.

---

## 3. Run it locally

```powershell
cd web
copy .env.local.example .env.local   # then paste in your values
npm install
npm run dev
```

Open <http://localhost:3000>. It will ask for the dashboard key.

---

## 4. Deploy to Vercel

```powershell
npm i -g vercel
vercel link
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel --prod
```

Or push the repo to GitHub and import it in the Vercel dashboard - set the same
two environment variables under **Settings → Environment Variables**.

Your dashboard is then at `https://<project>.vercel.app`.

---

## 5. Open it on your phone

Visit `https://<project>.vercel.app`. That's it - no key, no prompt.

---

## Security model

There is no Supabase anon key in the browser bundle at all - none is needed.

| Layer | How it is protected |
|-------|--------------------|
| Supabase table | RLS enabled, zero policies. Anon key reads nothing. |
| Next.js route | Uses the **service role** key, held in Vercel env vars only. |
| The route itself | **Open - there is no gate.** |

**The dashboard is deliberately unprotected.** Anyone who opens the URL reads
everything the hotkey has ever sent, including the text you highlighted. That
was a deliberate choice for convenience, so:

- Treat the URL as public. Do not put anything in a selection you would not
  want a stranger to read.
- Vercel project URLs are unguessable, but the link leaks easily - browser
  history, screenshots, referrer headers, anyone you show it to.
- To cut someone off, rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase and
  redeploy; there is no key left to change on the dashboard itself.

Supabase still rejects all direct access, so the only way in is this one route.

---

## Config

| Env var | Where it lives | What it does |
|---------|----------------|--------------|
| `SUPABASE_URL` | Vercel + desktop `.env` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + desktop `.env` | Read/write, bypasses RLS |

Polling interval is `POLL_MS` in [`app/page.js`](app/page.js), 3 seconds by
default. Change it and redeploy.

---

## Notes

- **Not a realtime channel.** It polls. Three seconds is a comfortable balance
  between latency and Supabase request volume on the free tier.
- **Free tier limits.** Supabase free allows 500 MB database and the app makes
  one request per client per 3 seconds. A few hours of heavy use is nowhere
  near the limit.
- **Clipboard copy needs HTTPS.** On `http://localhost` some browsers block
  `navigator.clipboard`. Vercel is HTTPS, so this only affects local dev.
- **Deleting history.** `delete from public.answers;` in the SQL editor wipes
  everything.
