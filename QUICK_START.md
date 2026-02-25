# ✅ Quick Setup Checklist

Copy this checklist and check off items as you complete them!

## 🎯 Supabase Setup (5 minutes)

- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project (wait 2-3 min for initialization)
- [ ] Go to Settings → API
- [ ] Copy Project URL
- [ ] Copy anon public key
- [ ] Go to SQL Editor
- [ ] Run the SQL from `supabase/schema.sql`
- [ ] Verify "Success. No rows returned" message

## 💻 Local Development (2 minutes)

- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Paste your Supabase URL into `.env.local`
- [ ] Paste your Supabase anon key into `.env.local`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Create a test account
- [ ] Add a test task
- [ ] Verify task appears

## 🌐 Vercel Deployment (5 minutes)

- [ ] Push code to GitHub
- [ ] Sign in to Vercel with GitHub
- [ ] Import your repository
- [ ] Let Vercel deploy (don't add env vars yet)
- [ ] Go to Settings → Environment Variables
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` (all environments)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (all environments)
- [ ] Go to Deployments tab
- [ ] Redeploy the latest deployment
- [ ] Visit your production URL
- [ ] Test creating account and adding tasks

## 🎉 Done!

Your app is now:
- ✅ Running locally
- ✅ Deployed to production
- ✅ Connected to Supabase
- ✅ Ready to use!

---

## 📚 Need More Details?

- **Full Instructions**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Credential Help**: See [CREDENTIALS_GUIDE.md](CREDENTIALS_GUIDE.md)
- **Technical Details**: See [FIXES_APPLIED.md](FIXES_APPLIED.md)

---

## 🆘 Something Not Working?

### Local Development Issues
1. Check `.env.local` has correct values (no quotes, no spaces)
2. Restart dev server after changing `.env.local`
3. Check browser console for errors
4. Verify SQL schema was run in Supabase

### Vercel Deployment Issues
1. Verify BOTH environment variables are added
2. Redeploy after adding environment variables
3. Check Vercel deployment logs
4. Test with a fresh incognito window

### Authentication Issues
1. Check Supabase → Authentication → Providers → Email is enabled
2. Disable "Confirm email" for testing
3. Try a different email address
4. Check Supabase logs for errors

---

## 🎯 Time Estimate

- **Total Setup Time**: ~12 minutes
- **Supabase Setup**: 5 minutes
- **Local Dev**: 2 minutes
- **Vercel Deploy**: 5 minutes

You've got this! 🚀
