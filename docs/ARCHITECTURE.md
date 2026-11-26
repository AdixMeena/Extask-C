# Architecture and how to extend ExTask

## Request flow

`React page → api/endpoints.js → axios (adds Bearer token, refreshes it once on 401) → Express route → middleware (auth) → controller (validate → rules → query) → Supabase → JSON back`

* Routes only map URLs to controllers.
* Controllers hold the business rules and are wrapped in `asyncHandler`.
* Validation is in `server/utils/validators.js` as **pure functions** (unit tested), applied with `assertValid`.
* Expected failures are thrown as `HttpError` (`badRequest`, `forbidden`, `conflict` …); one error handler formats every response.
* Anything that must be all-or-nothing lives in Postgres (`select_bid`), not in JavaScript.
* Which profile columns a visitor may see is decided in one file: `server/utils/serializers.js`.

## Adding a feature: worked example "save a task for later"

1. **Database.** New file `server/db/migrations/002_saved_tasks.sql` with the table, run in the SQL Editor; copy it into `schema.sql`. Enable row level security on the new table (no policies).
2. **Validation.** If it takes input, add `validateX` to `utils/validators.js` and a test in `tests/`.
3. **Controller + route.** `controllers/savedController.js`, then register it in a router and mount it in `app.js`.
4. **Client API.** Add `savedApi` to `client/src/api/endpoints.js`.
5. **UI.** A component or page that calls `useApi(() => savedApi.list())` and shows loading, empty and error states (see `MyBids.jsx`).
6. **Docs.** Add the endpoint to the table in `README.md`.

## Conventions

* No component writes a URL or touches axios: use `api/endpoints.js`.
* Colours, fonts and sizes come from `client/src/styles/tokens.css`. Change a colour once, it changes everywhere.
* Animation: use framer-motion, keep each between 150–500 ms, animate only `transform` and `opacity`. `MotionConfig reducedMotion="user"` in `main.jsx` honours the OS reduced-motion setting, and `base.css` also shortens CSS animations.
* Never import `supabaseAdmin` in anything that runs in the browser, and never expose the service role key.
* Comments explain *why*, not *what*.

## Data model

```
profiles 1──* tasks 1──* bids *──1 profiles
                  │  └─ selected_bid_id → bids (set by select_bid)
                  └──* reviews (reviewer_id, reviewee_id → profiles)
```

Task status: `open → assigned → completed` (or `open → cancelled`). Bid status: `pending → accepted | rejected`.

## Known limits (good "future scope" talking points)

* Forgot-password by email does not work for phone-only accounts (no SMS provider, no OTP by design).
* ID verification is manual (no admin panel). No payments, chat, maps or mobile app.
* Rate limiting is in-memory per instance.
* The task detail page polls every 20 s for new bids; real-time (Supabase Realtime or WebSockets) is the next step.
