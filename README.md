# Moving to NYC — planner

Phase 1: scenarios + milestone timelines, with login for both of you.
Phase 2: neighborhoods, schools (zoned across neighborhoods), and childcare.
Phase 3: filterable real estate listings, with best-effort scraping from a
pasted URL.

## What's here

- `src/db/schema.ts` — `users`, `scenarios`, `milestone_templates`,
  `milestones`, `neighborhoods`, `schools`, `school_neighborhoods` (join
  table — a school can span more than one neighborhood), `childcare_options`,
  `listings`
- `src/db/seed.ts` — creates your two accounts + the default milestone template
- `src/app/scenarios/` — create a scenario (auto-seeds milestones from the
  template, calculated off the arrival date), then open it to check off
  milestones or override individual dates
- `src/app/neighborhoods/` — add neighborhoods; each one's detail page shows
  its linked schools and childcare
- `src/app/schools/` — add schools with a real-estate search link and
  checkboxes for which neighborhoods it's zoned in
- `src/app/childcare/` — add childcare options, each tied to one neighborhood
- `src/app/listings/` — filter by status (for sale / for rent / sold) and
  neighborhood; paste a listing URL and hit "Fetch details" to try pulling
  address/price/photo automatically (from the site's own schema.org/Open
  Graph tags), then correct and save. Some sites block this — StreetEasy and
  Zillow in particular have strong bot protection — in which case it just
  falls back to a blank form
- `src/auth.ts` / `src/auth.config.ts` — email/password login (Auth.js), no
  self-signup. Split into two files so the Edge middleware never has to load
  bcrypt/db code (`auth.config.ts` is the Edge-safe base; `auth.ts` adds the
  Credentials provider for the actual sign-in route)

## Upgrading from phase 1

If you already ran phase 1's migration, just run `npm run db:migrate` again —
it only applies the new migration file for the neighborhoods/schools/childcare
tables, it won't touch your existing scenarios or milestones.

## First-time setup

1. **Create a Neon database** at [neon.tech](https://neon.tech) (free tier is
   plenty). Copy the connection string.
2. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — the Neon connection string
   - `AUTH_SECRET` — run `npx auth secret` and paste the result
3. Install and run the migration:
   ```
   npm install
   npm run db:migrate
   ```
4. Open `src/db/seed.ts`, replace the two placeholder emails/passwords with
   real ones for you and your husband, and edit the default milestone list if
   you want to change it now (you can also edit milestones per-scenario later
   in the UI). Then:
   ```
   npm run db:seed
   ```
5. Run it locally:
   ```
   npm run dev
   ```
   Visit `localhost:3000`, sign in, and create your first scenario.

## Deploying

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the same two environment variables (`DATABASE_URL`, `AUTH_SECRET`) in
   the Vercel project settings.
4. Deploy. Run `npm run db:migrate` and `npm run db:seed` once against the
   production `DATABASE_URL` (from your machine, pointed at the same Neon
   database Vercel uses) before first sign-in.

## What's next (not built yet)

- Melbourne-side vendor tracker (cleaners, agents, painters, stagers, movers)
- To-do lists, optionally linked to a milestone
