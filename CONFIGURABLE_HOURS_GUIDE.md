# Configurable Work Hours - Setup Guide

## Overview

Users can now customize their daily work window instead of being locked to the default 4 AM - 8 PM (16 hours) schedule.

---

## For New Installations

If you're setting up the app fresh, the `schema.sql` already includes the `user_preferences` table. Just run it as normal.

---

## For Existing Installations

If you already have the app running, you need to add the new table:

### Step 1: Run Migration SQL

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migration_add_user_preferences.sql`
5. Click **Run**

### Step 2: Verify

Check that the table was created:

```sql
select * from public.user_preferences;
```

You should see an empty table (or rows if you uncommented the auto-create section).

---

## How It Works

### Default Behavior

- **New users:** Get default preferences (4 AM start, 16 hours duration)
- **Existing users:** Preferences are auto-created on first settings page visit
- **Demo mode:** Uses default 4 AM - 8 PM window (no database)

### User Flow

1. User logs in and goes to `/today`
2. Clicks **⚙️ Settings** button (top right)
3. Configures:
   - **Work Start Time:** Any hour from 12 AM to 11 PM
   - **Work Duration:** 8 to 24 hours
4. Clicks **💾 Save Settings**
5. Redirected back to `/today` with new window applied

### Technical Details

**Database Table:**
```sql
user_preferences (
  id uuid,
  user_id uuid (unique),
  work_start_hour integer (0-23),
  work_duration_hours integer (8-24),
  created_at timestamptz,
  updated_at timestamptz
)
```

**Window Calculation:**
- Start time is set to `work_start_hour` on current day
- If current time is before start hour, uses previous day's window
- End time is `start + work_duration_hours`
- Handles overnight windows (e.g., 10 PM - 6 AM)

---

## Common Configurations

### Early Bird (5 AM - 9 PM)
```
Start: 5 AM
Duration: 16 hours
Window: 5:00 AM → 9:00 PM
```

### Standard Workday (8 AM - 6 PM)
```
Start: 8 AM
Duration: 10 hours
Window: 8:00 AM → 6:00 PM
```

### Extended Day (8 AM - 10 PM)
```
Start: 8 AM
Duration: 14 hours
Window: 8:00 AM → 10:00 PM
```

### Night Owl (10 AM - 2 AM)
```
Start: 10 AM
Duration: 16 hours
Window: 10:00 AM → 2:00 AM (next day)
```

### Focused Sprint (9 AM - 6 PM)
```
Start: 9 AM
Duration: 9 hours
Window: 9:00 AM → 6:00 PM
```

### Maximum Hustle (6 AM - 12 AM)
```
Start: 6 AM
Duration: 18 hours
Window: 6:00 AM → 12:00 AM (Midnight)
```

---

## Features

### Settings Page (`/settings`)

- **Visual preview** of work window
- **Dropdown selectors** for easy configuration
- **Real-time calculation** of end time
- **Next day indicator** for overnight windows
- **Helpful tips** for choosing settings

### Today Page Updates

- **Dynamic window display** shows user's custom hours
- **Settings button** for quick access
- **Automatic window calculation** based on preferences
- **Backward compatible** with default 16-hour window

---

## Troubleshooting

### "Settings button doesn't appear"

→ You're in demo mode (no Supabase). Settings only work with database.

### "My window didn't change after saving"

→ Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### "I see 'Error saving settings'"

→ Check that you ran the migration SQL in Supabase

### "Can I set a 24-hour window?"

→ Yes! Set duration to 24 hours. Your window will span the full day.

### "What if I work irregular hours?"

→ Set your window to cover your most productive hours. You can adjust anytime.

---

## Best Practices

### Choosing Your Start Time

- **Morning person?** Start at 5-7 AM
- **Standard schedule?** Start at 8-9 AM  
- **Night owl?** Start at 10 AM-12 PM
- **Flexible?** Start when you typically begin focused work

### Choosing Your Duration

- **Realistic is key:** Don't set 18 hours if you can only focus for 10
- **Include breaks:** Your window should include short breaks
- **Buffer time:** Leave room for interruptions (Reality Audit will help)
- **Start conservative:** Begin with 10-12 hours, increase as needed

### Optimization Strategy

1. **Week 1:** Use default or guess your ideal window
2. **Week 2:** Review Reality Audit to see actual productive hours
3. **Week 3:** Adjust window to match reality
4. **Week 4+:** Fine-tune based on patterns

---

## Migration Checklist

For existing installations:

- [ ] Run `migration_add_user_preferences.sql` in Supabase
- [ ] Verify table exists: `select * from user_preferences;`
- [ ] Test settings page: Visit `/settings` while logged in
- [ ] Configure your hours and save
- [ ] Verify today page shows your custom window
- [ ] Test overnight windows (e.g., 10 PM - 6 AM)

---

## Code Changes Summary

**New Files:**
- `app/settings/page.tsx` - Settings page
- `components/settings-form.tsx` - Settings form component
- `supabase/migration_add_user_preferences.sql` - Migration SQL

**Modified Files:**
- `app/today/page.tsx` - Fetches user preferences
- `supabase/schema.sql` - Added user_preferences table
- `types/db.ts` - Added user_preferences type

**Database Changes:**
- New table: `user_preferences`
- New RLS policy: "Users can manage own preferences"
- New trigger: `set_preferences_updated_at`

---

## Future Enhancements

Potential additions:

- [ ] Multiple work windows per day (morning + evening)
- [ ] Different windows for different days (weekday vs weekend)
- [ ] Break time scheduling
- [ ] Timezone handling for travelers
- [ ] Work window templates (presets)
- [ ] Analytics on optimal work hours

---

## Support

**Questions?**
- Check if migration SQL ran successfully
- Verify RLS policies are enabled
- Check browser console for errors
- Ensure you're logged in (not demo mode)

**Need help?** Open an issue with:
- Error message (if any)
- Browser console logs
- Steps to reproduce

---

**Your productivity, your schedule. Configure it your way.** ⚙️
