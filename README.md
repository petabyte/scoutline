# Scoutline

A recruiting directory for high school basketball players. Players pay $9/mo
to keep a verified profile (stats, bio, highlight film link) live in a
searchable directory and in curated ranked lists. Coaches and scouts browse
for free.

Stack: Next.js 14 (App Router) + Supabase (auth, database, storage) + Stripe
(subscription billing). No servers to manage — deploys to Vercel.

## What's built

- Public landing page, player directory with filters (grad year, position,
  name search), individual player profile pages, curated ranked lists.
- Player signup → Stripe Checkout → profile goes live automatically via
  webhook when payment succeeds, and comes down automatically if a payment
  fails or the subscription is canceled.
- Player dashboard: edit stats/bio/film link, upload a headshot, manage
  billing (Stripe Customer Portal — cancel anytime).
- Free coach accounts, gated view of contact email (reduces spam/scraping).
- Admin panel at `/admin/lists`: build curated ranked lists, mark players
  "Verified."

## What you still need to decide/do before launch

1. **Verification process.** The code has a "Verified" toggle an admin
   flips manually. Decide what you'll actually check (roster listing, a
   coach reference, a screenshot of a stat sheet) — this is the trust
   signal the whole product depends on, and it's a judgment call, not code.
2. **Minors and payment.** Most of your players will be under 18. The
   signup page tells a parent/guardian to complete payment, but you should
   have an actual Terms of Service / parental-consent checkbox reviewed by
   a lawyer before charging cards tied to minors' profiles — this is a
   legal, not technical, requirement.
3. **Price.** $9/mo is a placeholder threaded through the checkout flow —
   change it by editing the Stripe Price, not the code.

## Setup

### 1. Supabase

1. Create a project at supabase.com.
2. Project Settings → API: copy the Project URL, `anon` public key, and
   `service_role` key into `.env.local` (copy `.env.example` first).
3. SQL Editor → run `supabase/schema.sql` once, in full.
4. Storage → create a bucket named `headshots`, set it to **public**.
5. Authentication → Providers: email/password is on by default. For faster
   testing, turn off "Confirm email" (Authentication → Settings) — turn it
   back on before launch, or players' accounts will need email
   confirmation before they can log back in.
6. Table Editor → `admins` table → add a row with your own email address.
   That email can now access `/admin/lists`.

### 2. Stripe

1. Create a Product ("Scoutline Player Profile") with a recurring $9/month
   Price. Copy the Price ID (starts `price_`) into
   `STRIPE_PLAYER_PRICE_ID`.
2. Developers → API keys → copy the secret key into `STRIPE_SECRET_KEY`.
3. Developers → Webhooks → add an endpoint once you have a deployed URL:
   `https://yourdomain.com/api/stripe/webhook`, listening for
   `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`. Copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
   - For local testing, run `stripe listen --forward-to
     localhost:3000/api/stripe/webhook` instead, and use the webhook
     secret it prints.

### 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### 4. Deploy

Push this repo to GitHub, import it into Vercel, and add all the
`.env.example` variables as Environment Variables in the Vercel project
settings (set `NEXT_PUBLIC_SITE_URL` to your real domain). Then point the
Stripe webhook at your live URL as in step 2.3.

## Project structure

```
app/
  page.tsx                 landing page
  players/page.tsx          directory + filters
  players/[slug]/page.tsx   public profile
  lists/, lists/[slug]/     curated ranked lists
  join/                     player signup → Stripe Checkout
  login/                    player + coach login, coach signup
  dashboard/                player's own editor + billing
  admin/lists/               admin: curate lists, verify players
  api/stripe/                checkout, webhook, billing portal
  api/admin/                  admin-only writes (list/verify management)
lib/supabase/                browser/server/service Supabase clients
lib/stripe.ts                Stripe client
supabase/schema.sql           full database schema + Row Level Security
```

## Extending it

- **Regions/state filter**: add a `state` column to `players` and a filter
  control identical to the grad-year one in `app/players/page.tsx`.
- **"Viewed by N coaches" analytics**: log a row to a `profile_views` table
  from the player profile page when `isLoggedInCoach` is true, then show a
  count on the dashboard — a real driver of renewal once players can see
  coaches are actually looking.
- **Multiple sports**: add a `sport` column, filter by it everywhere `position`
  is filtered, and swap `position` options per sport.
