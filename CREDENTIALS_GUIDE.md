# 🔑 Quick Reference: Getting Supabase Credentials

## Where to Find Your Credentials

### 1. Project URL
**Location:** Supabase Dashboard → Settings → API → Project URL

**Format:** `https://xxxxxxxxxxxxx.supabase.co`

**Example:** `https://abcdefghijklmnop.supabase.co`

---

### 2. Anon Key (Public API Key)
**Location:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

**Format:** Long JWT token starting with `eyJ...`

**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzg3MjQwMCwiZXhwIjoxOTM5NDQ4NDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step-by-Step Visual Guide

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Sign in to your account

2. **Select Your Project**
   - Click on your project from the list

3. **Navigate to Settings**
   - Click the ⚙️ (gear icon) in the left sidebar
   - Or click "Project Settings" at the bottom

4. **Go to API Settings**
   - Click "API" in the settings menu

5. **Copy Your Credentials**
   - **Project URL**: Copy the URL under "Project URL" section
   - **Anon Key**: Copy the key under "Project API keys" → `anon` `public`

---

## What to Do With These Credentials

### For Local Development:
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel Deployment:
Add as Environment Variables in Vercel:
- Variable 1: `NEXT_PUBLIC_SUPABASE_URL` = your project URL
- Variable 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key

---

## ⚠️ Important Notes

- **Anon Key is Safe to Expose**: The anon key is designed to be public and used in client-side code
- **Never Share Service Role Key**: If you see a `service_role` key, NEVER expose it publicly
- **URL Format**: Make sure to include `https://` in the URL
- **No Quotes Needed**: In `.env.local`, don't wrap values in quotes
- **Restart After Changes**: Restart your dev server after updating `.env.local`

---

## 🔒 Security

The anon key is protected by:
- Row Level Security (RLS) policies in your database
- Users can only access their own data
- All authentication is handled securely by Supabase

---

## ✅ Verification

To verify your credentials are working:
1. Start your dev server: `npm run dev`
2. Open http://localhost:3000
3. Try creating an account
4. If successful, your credentials are correct!
