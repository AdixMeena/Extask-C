# Run ExTask on your computer

Time needed: about 15 minutes. You need **Node.js 18.18 or newer** (20 recommended) and a free **Supabase** account.
Check Node: `node --version`.

## 1. Create the Supabase project

1. Go to https://supabase.com, sign in, click **New project**. Pick any name (for example `extask`), set a database password, choose the region nearest you (Mumbai if available), click **Create**. Wait about two minutes.
2. Open **SQL Editor → New query**, paste the entire contents of `server/db/schema.sql`, click **Run**. You should see "Success".
3. Open **Project Settings → API** (called "API Keys" in newer dashboards) and copy:
   * **Project URL**
   * **Publishable / anon key** (safe-looking, but still keep it in `.env`)
   * **Secret / service_role key** (**private**: never share it, never put it in the client, never commit it)

## 2. Install

From the project root:

```bash
npm run setup
```

This installs the root, `server/` and `client/` packages.

## 3. Configure the server

```bash
cp server/.env.example server/.env      # Windows: copy server\.env.example server\.env
```

Edit `server/.env`:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<secret key>
PORT=5000
CLIENT_URL=http://localhost:5173
```

The client needs no `.env` locally: Vite proxies `/api` to the server for you.

## 4. Load demo data

```bash
npm run seed
```

It creates five users, eight tasks, bids and reviews, and prints the logins. Every demo password is `Demo@1234`. Re-running it resets the demo data.

## 5. Start everything

```bash
npm run dev
```

* Website: http://localhost:5173
* API health check: http://localhost:5000/api/health

Log in as `aarav` / `Demo@1234`, or as `9876543210` / `Demo@1234` (phone login).

## Useful commands

| Command | Use |
|---|---|
| `npm test` | Run the server unit tests |
| `npm run build` | Production build of the client into `client/dist` |
| `npm --prefix client run preview` | Serve the production build on http://localhost:4173 (add it to `CLIENT_URL` if you test against the API directly) |

## Troubleshooting

| Problem | Fix |
|---|---|
| `Missing environment variables: ...` when the server starts | `server/.env` is missing or a key is empty. Re-check step 3. |
| Home page says "Could not load tasks. Is the server running?" | Server not running, or it crashed. Look at the terminal that runs `npm run dev`. |
| Seed fails with `relation "profiles" does not exist` | `schema.sql` was not run. Do step 1.2. |
| Seed fails with `Invalid API key` | Wrong key in `.env`. Use the **secret/service_role** key for `SUPABASE_SERVICE_ROLE_KEY`. |
| Browser shows a CORS error | `CLIENT_URL` in `server/.env` must exactly match the address in your browser (no trailing slash). Restart the server after editing. |
| Port 5000 is already in use (macOS AirPlay uses it) | Set `PORT=5001` in `server/.env` and change the proxy target in `client/vite.config.js` to `http://localhost:5001`. |
| Registering says "Please fix the highlighted fields" | Read the red message under each field (username rules, 10-digit phone, 8+ character password). |
