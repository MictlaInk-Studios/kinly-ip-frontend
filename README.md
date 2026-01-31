# Kinly — IP Creation Frontend (Next.js + Supabase)

This repository is a minimal frontend for an IP-creation SaaS using Next.js, Supabase, and deployable on Vercel. It includes a simple IP creation form that inserts into a Supabase `ips` table.

Quick start

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill values from your Supabase project

3. Run the dev server

```bash
npm run dev
```

4. Create a Supabase table named `ips` with at least these columns:

 - `id` (uuid) default `gen_random_uuid()` or `uuid_generate_v4()`
 - `title` text
 - `description` text
 - `owner` text
 - `created_at` timestamp with time zone default `now()`

Deployment

- Push this repo to GitHub and connect it to Vercel (Vercel will detect Next.js).
- Add the same env variables in Vercel project settings.
- Optionally add the Supabase service role key to server-side functions if you need restricted operations.
