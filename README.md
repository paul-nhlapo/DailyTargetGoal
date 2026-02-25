Daily Target Goal

A Next.js 14 + Supabase web app to timebox your day within a focused 16-hour window. Supabase-only: Auth + DB. No Google integration.

Features
- Supabase Auth (email/password) with session persistence
- 16-hour Today view with task CRUD
- Supabase-only (Auth + DB). No Google dependencies.
- Deployable on Vercel

Local Setup
1) Copy .env.example to .env.local and fill values:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   
2) Install and run
   npm install
   npm run dev

Supabase Setup
- Create a project in Supabase and copy the URL and anon key to env
- Run SQL in supabase/schema.sql in Supabase SQL editor to create tables and RLS policies


Vercel Deployment
- Import the repo into Vercel
- Set Environment Variables to reference the ones in vercel.json (Project Settings -> Environment Variables)
- Deploy.

Notes
- All timestamps stored in UTC; client formats in local time.
- The Today page assumes a 16-hour window from 00:00 to +16h of your local day start. Adjustments can be implemented later per-user.
- Minimal UI provided via Tailwind. Extend as needed.
