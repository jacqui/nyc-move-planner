# Moving to NYC — planner

Phase 1: scenarios + milestone timelines, with login for both of you.

## What's here

- `src/db/schema.ts` — `users`, `scenarios`, `milestone_templates`, `milestones`
- `src/db/seed.ts` — creates your two accounts + the default milestone template
- `src/app/scenarios/` — create a scenario (auto-seeds milestones from the
  template, calculated off the arrival date), then open it to check off
  milestones or override individual dates
- `src/auth.ts` — email/password login (Auth.js), no self-signup — only the
  accounts you seed can log in

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

- Neighborhoods, schools, and childcare options (linked to each other)
- Filterable real estate listings
- Melbourne-side vendor tracker (cleaners, agents, painters, stagers, movers)
- To-do lists, optionally linked to a milestone
