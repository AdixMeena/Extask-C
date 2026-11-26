# Deploy ExTask (Supabase + Vercel)

Plan: **one GitHub repo → two Vercel projects** (server and client) **+ one Supabase project**.

| Part | Where | Setting |
|---|---|---|
| Database + Auth | Supabase | free project |
| Express API | Vercel project #1 | Root Directory `server` |
| React site | Vercel project #2 | Root Directory `client`, preset Vite |

## Environment variables (all of them)

| Variable | Project | Value |
|---|---|---|
| `SUPABASE_URL` | server | Supabase Project URL |
| `SUPABASE_ANON_KEY` | server | publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | secret / service_role key (**server only, never in GitHub or the client**) |
| `CLIENT_URL` | server | the client's Vercel URL, e.g. `https://extask.vercel.app` (comma-separate several origins) |
| `VITE_API_URL` | client | the server's Vercel URL **plus `/api`**, e.g. `https://extask-api.vercel.app/api` |

`PORT` is not needed on Vercel.

## Steps

1. **GitHub.** Create a repository and push the whole `extask/` folder (`client/` and `server/` stay together). `.env` files are git-ignored; check that no secret is committed.
   ```bash
   git init && git add . && git commit -m "ExTask" 
   git branch -M main
   git remote add origin https://github.com/<you>/extask.git
   git push -u origin main
   ```
2. **Supabase.** Create the project, run `server/db/schema.sql` in the SQL Editor, copy the URL and the two keys (see docs/RUN_LOCALLY.md, step 1).
3. **Server on Vercel.** *Add New → Project →* import the repo. Set **Root Directory = `server`**. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and a temporary `CLIENT_URL=http://localhost:5173`. Deploy. Open `https://<server>.vercel.app/api/health`: you should see `{"status":"ok"}`.
4. **Client on Vercel.** Import the same repo again as a second project. **Root Directory = `client`**, framework **Vite** (build `npm run build`, output `dist`). Add `VITE_API_URL=https://<server>.vercel.app/api`. Deploy. `client/vercel.json` already contains the rewrite that stops deep links like `/tasks/123` from returning 404 on refresh.
5. **Fix CORS.** In the server project, change `CLIENT_URL` to the client's real URL (no trailing slash) and **redeploy** (Deployments → ⋯ → Redeploy). Environment changes only apply to new deployments.
6. **Test** on the live URL: register, post a task, bid from a second account, hire, complete, rate.
7. **Demo data (optional).** Run the seed against the production database from your computer, with `server/.env` pointing to the same Supabase project: `npm run seed`.

## Why the code already works on Vercel

* `server/index.js` exports the Express app; it only calls `listen()` when `VERCEL` is not set.
* supabase-js talks to Supabase over HTTPS, so there are no database connections to manage in serverless functions.
* The server has no `express.static()`; the client is a separate deployment.
* A global error handler turns every failure into a clean JSON response.
* The rate limiter's counter is per serverless instance. That is fine for a project; for production use a shared store.

## Updating the live site

Push to `main`. Both Vercel projects rebuild automatically. For database changes, add a numbered file in `server/db/migrations/` and run it in the Supabase SQL Editor **before** deploying code that needs it.

## If the server misbehaves on Vercel: Render / Railway fallback

Deploy `server/` as a normal Node web service (Render, Railway):

* Root directory `server`, build `npm install`, start `npm start`.
* Same four server variables. Render sets `PORT` itself.
* Set the client's `VITE_API_URL` to `https://<your-service>/api` and redeploy the client.

Nothing in the code changes. Free tiers sleep when idle (first request can take about 30 seconds), and free Supabase projects pause after a period of inactivity, so open both a few minutes before your demo. Check current limits before the presentation.

## Setting the Verified badge

There is no admin panel yet. In Supabase: **Table Editor → profiles →** find the user, read `id_details`, tick `id_verified`.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Browser console: CORS error | `CLIENT_URL` on the server does not exactly match the client URL, or you did not redeploy after changing it. |
| Every API call 404s | `VITE_API_URL` is missing `/api`, or was set after the client was built. Redeploy the client. |
| `Missing environment variables` in server logs | Variable not set for the **Production** environment on that Vercel project. |
| Refreshing `/tasks/123` gives 404 | `client/vercel.json` missing, or Root Directory is not `client`. |
| Login says "Wrong username, email, phone or password" for the seeded users | The seed ran against a different Supabase project than the server uses. |
| App worked yesterday, now every request fails | The free Supabase project paused. Open the dashboard and click **Restore**. |
