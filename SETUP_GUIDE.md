# Daily Target Goal - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- A Vercel account (for deployment, optional)

---

## 📋 Part 1: Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a new account or sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: `daily-target-goal` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine
6. Click "Create new project"
7. Wait 2-3 minutes for project to initialize

### Step 2: Get Your Supabase Credentials

1. Once your project is ready, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys" section - a long string starting with `eyJ...`)
4. **Copy both values** - you'll need them in the next step

### Step 3: Set Up Database Tables

1. In your Supabase project, click on **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - this is correct!

This creates:
- `tasks` table with proper columns
- Row Level Security (RLS) policies so users only see their own tasks
- Automatic timestamp updates

---

## 💻 Part 2: Local Development Setup

### Step 1: Install Dependencies

```bash
cd DailyTargetGoal
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env.local
   ```

2. Open `.env.local` in your text editor

3. Replace the placeholder values with your Supabase credentials from Part 1, Step 2:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Test the Application

1. Click "Login" or "Create account"
2. Enter an email and password (use a real email if you want email confirmations)
3. Click "Create account"
4. You should be redirected to the "Today" page
5. Try adding a task!

---

## 🌐 Part 3: Deploy to Vercel

### Step 1: Push to GitHub (if not already done)

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/daily-target-goal.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `daily-target-goal` repository
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"

### Step 3: Add Environment Variables to Vercel

**IMPORTANT**: Your app won't work until you add these!

1. After deployment, go to your project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in the left sidebar
4. Add these two variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL (from Part 1, Step 2)
   - Environment: Production, Preview, Development (check all)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key (from Part 1, Step 2)
   - Environment: Production, Preview, Development (check all)

5. Click "Save" for each variable

### Step 4: Redeploy

1. Go to the "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Your app should now work at your Vercel URL!

---

## 🔧 Troubleshooting

### "Failed to fetch" or "Invalid API key" errors
- Double-check your `.env.local` file has the correct Supabase URL and anon key
- Make sure there are no extra spaces or quotes around the values
- Restart your dev server after changing `.env.local`

### "No rows returned" when trying to add tasks
- Make sure you ran the SQL schema in Supabase (Part 1, Step 3)
- Check that Row Level Security is enabled on the `tasks` table
- Verify you're signed in (check the header for "Sign out" button)

### Email confirmation required
- By default, Supabase requires email confirmation
- To disable for testing:
  1. Go to Supabase → Authentication → Providers
  2. Click on "Email"
  3. Toggle off "Confirm email"
  4. Save

### Vercel deployment works but shows errors
- Make sure you added BOTH environment variables in Vercel
- Redeploy after adding environment variables
- Check Vercel logs for specific errors

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🎯 Features

- ✅ Supabase email/password authentication
- ✅ 16-hour daily task window
- ✅ Create, read, update, delete tasks
- ✅ Time-based task scheduling
- ✅ Responsive design with Tailwind CSS
- ✅ Demo mode (works without Supabase for testing)

---

## 📝 Notes

- All timestamps are stored in UTC and displayed in your local timezone
- The "Today" view shows a 16-hour window from midnight to 4 PM
- Tasks outside the window are automatically filtered
- Demo mode stores tasks in browser localStorage (no account needed)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check browser console for error messages
4. Check Vercel deployment logs if deployed
