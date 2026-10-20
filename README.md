# hackly-kit-next-supabase

Starter kit hackly builds hackathon apps from: Next.js 16 app router, Supabase auth (magic link) and Postgres, Tailwind v4.

```sh
npm ci
cp .env.example .env.local   # fill in your supabase url + anon key
npm run dev                  # http://localhost:3000
```

Run `supabase/migrations/0001_init.sql` on your project (SQL editor or `supabase db push`) before signing in, it creates `profiles`.

`npm run smoke` builds and checks that `/` responds. Needs no real Supabase.

Read `KIT.md` before adding anything.
