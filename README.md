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

## the model

`lib/ai.ts` exports `ask()`. On a hackly build the env already has `HACKLY_AI_URL` and `HACKLY_AI_KEY`, and every call counts against the pass's allowance. To use your own OpenAI account instead, set `OPENAI_API_KEY` in Vercel (or `.env.local`) and the same function talks to OpenAI directly.

```ts
import { ask } from "@/lib/ai";
const summary = await ask({ text: "three bullet points on: " + note });
```

When the allowance is used up `ask()` throws `AiOutError`; render `<AiOut/>` from `components/AiOut.tsx` in that spot.

