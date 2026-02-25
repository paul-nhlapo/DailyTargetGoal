# Configurable Work Hours - Implementation Summary

## ✅ What Was Added

Users can now customize their daily work window instead of being locked to 4 AM - 8 PM (16 hours).

---

## 🎯 Key Features

### Settings Page (`/settings`)
- **Accessible from:** Today page → Click "⚙️ Settings" button (top right)
- **Configure:**
  - Work start time (any hour: 12 AM - 11 PM)
  - Work duration (8-24 hours)
- **Visual preview** of your work window
- **Real-time calculation** showing end time
- **Next day indicator** for overnight windows

### Common Configurations

| Profile | Start | Duration | Window |
|---------|-------|----------|--------|
| Early Bird | 5 AM | 16h | 5 AM → 9 PM |
| Standard | 8 AM | 10h | 8 AM → 6 PM |
| Extended | 8 AM | 14h | 8 AM → 10 PM |
| Night Owl | 10 AM | 16h | 10 AM → 2 AM (next day) |
| Focused | 9 AM | 9h | 9 AM → 6 PM |
| Maximum | 6 AM | 18h | 6 AM → 12 AM |

---

## 📁 Files Created

1. **`app/settings/page.tsx`** - Settings page (server component)
2. **`components/settings-form.tsx`** - Settings form (client component)
3. **`supabase/migration_add_user_preferences.sql`** - Migration for existing databases
4. **`CONFIGURABLE_HOURS_GUIDE.md`** - Complete documentation

---

## 📝 Files Modified

1. **`app/today/page.tsx`**
   - Fetches user preferences from database
   - Calculates work window based on user settings
   - Adds Settings button
   - Shows dynamic window duration

2. **`supabase/schema.sql`**
   - Added `user_preferences` table
   - Added RLS policy
   - Added trigger for updated_at

3. **`types/db.ts`**
   - Added `user_preferences` type definition

4. **`README.md`**
   - Added configurable hours to features
   - Added documentation link
   - Updated troubleshooting

---

## 🗄️ Database Schema

```sql
user_preferences (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES auth.users,
  work_start_hour integer DEFAULT 4,
  work_duration_hours integer DEFAULT 16,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Constraints:**
- `work_start_hour`: 0-23 (hour of day)
- `work_duration_hours`: 8-24 (hours)
- One preference row per user (enforced by unique constraint)

---

## 🚀 Setup Instructions

### For New Installations
Just run `supabase/schema.sql` - it includes everything.

### For Existing Installations
1. Go to Supabase SQL Editor
2. Run `supabase/migration_add_user_preferences.sql`
3. Verify: `SELECT * FROM user_preferences;`
4. Done!

---

## 🎮 User Flow

1. User logs in → Goes to `/today`
2. Sees default window (4 AM - 8 PM, 16 hours)
3. Clicks **⚙️ Settings** button
4. Configures start time and duration
5. Clicks **💾 Save Settings**
6. Redirected to `/today` with new window applied
7. All future sessions use custom window

---

## 💡 How It Works

### Window Calculation Logic

```typescript
// Get user preferences (or use defaults)
const workStartHour = prefs?.work_start_hour || 4
const workDurationHours = prefs?.work_duration_hours || 16

// Calculate window
const dayStart = new Date()
dayStart.setHours(workStartHour, 0, 0, 0)

// If before start time, use previous day's window
if (now.getHours() < workStartHour) {
  dayStart.setDate(dayStart.getDate() - 1)
}

const dayEnd = addHours(dayStart, workDurationHours)
```

### Overnight Windows
If your window crosses midnight (e.g., 10 PM - 6 AM):
- Start: 10 PM today
- End: 6 AM tomorrow
- The app handles this automatically
- Settings page shows "(next day)" indicator

---

## 🎯 Benefits

### For Users
- **Flexibility:** Match your natural rhythm (early bird vs night owl)
- **Realistic planning:** Set hours you can actually work
- **Better focus:** Window aligns with your peak productivity times
- **Work-life balance:** Shorter windows prevent burnout

### For Productivity
- **Accurate tracking:** Reality Audit reflects your actual work hours
- **Better estimates:** Time blocks match your real schedule
- **Focus Mode optimization:** Use during your peak hours
- **Auto-Ripple efficiency:** Tasks shift within your actual window

---

## 🔧 Technical Details

### Default Behavior
- **New users:** Get default (4 AM, 16h) on first login
- **Existing users:** Preferences auto-created on first settings visit
- **Demo mode:** Uses hardcoded default (no database)

### Data Flow
1. User saves settings → `user_preferences` table updated
2. User visits `/today` → Preferences fetched from database
3. Window calculated → Passed to `TodayTasks` component
4. All features (Focus Mode, Auto-Ripple, etc.) use custom window

### Performance
- Preferences fetched once per page load
- Cached in component state
- No real-time updates needed (settings change infrequently)

---

## 🧪 Testing Checklist

- [ ] Create new account → Default window (4 AM - 8 PM)
- [ ] Visit settings → See default values
- [ ] Change to 8 AM start, 10h duration → Save
- [ ] Return to today page → See 8 AM - 6 PM window
- [ ] Add tasks → Verify time blocks respect new window
- [ ] Test overnight window (e.g., 10 PM - 6 AM)
- [ ] Test Focus Mode → Works within custom window
- [ ] Test Auto-Ripple → Respects custom end time
- [ ] Log out and back in → Settings persist

---

## 🚨 Edge Cases Handled

1. **Overnight windows:** 10 PM - 6 AM works correctly
2. **24-hour windows:** Full day coverage supported
3. **Short windows:** 8-hour minimum enforced in UI
4. **Before start time:** Uses previous day's window
5. **Missing preferences:** Falls back to defaults
6. **Demo mode:** Uses defaults (no database)

---

## 📊 Example Scenarios

### Scenario 1: Early Bird Developer
```
Settings: 5 AM start, 14 hours
Window: 5:00 AM → 7:00 PM
Use case: Deep work in morning, meetings afternoon
```

### Scenario 2: Night Owl Freelancer
```
Settings: 12 PM start, 12 hours
Window: 12:00 PM → 12:00 AM (Midnight)
Use case: Avoid morning, work late into night
```

### Scenario 3: Focused Professional
```
Settings: 9 AM start, 9 hours
Window: 9:00 AM → 6:00 PM
Use case: Standard workday, strict boundaries
```

### Scenario 4: Shift Worker
```
Settings: 10 PM start, 10 hours
Window: 10:00 PM → 8:00 AM (next day)
Use case: Night shift, sleep during day
```

---

## 🎓 Best Practices

### Choosing Start Time
- When do you typically begin focused work?
- Consider your natural energy peaks
- Account for morning routine time

### Choosing Duration
- Be realistic (don't set 18h if you can only focus 10h)
- Include short breaks in your window
- Leave buffer for interruptions (Reality Audit helps)
- Start conservative, increase based on data

### Optimization Strategy
1. **Week 1:** Use default or best guess
2. **Week 2:** Review Reality Audit for actual productive hours
3. **Week 3:** Adjust window to match reality
4. **Week 4+:** Fine-tune based on patterns

---

## 🔮 Future Enhancements

Potential additions:
- [ ] Multiple windows per day (morning + evening sessions)
- [ ] Different windows for weekdays vs weekends
- [ ] Break time scheduling within window
- [ ] Timezone handling for travelers
- [ ] Work window templates/presets
- [ ] Analytics on optimal work hours
- [ ] Suggested window based on Reality Audit data

---

## 📞 Support

**Common Issues:**

**"Settings button doesn't appear"**
→ You're in demo mode. Settings require Supabase.

**"Changes didn't save"**
→ Check browser console for errors. Verify migration ran.

**"Window didn't update"**
→ Hard refresh (Ctrl+Shift+R). Check preferences in database.

**"Can I have different windows for different days?"**
→ Not yet. Currently one window applies to all days.

---

## ✅ Success Criteria

Feature is working correctly when:

- ✅ Settings page loads without errors
- ✅ User can change start time and duration
- ✅ Preview shows correct window calculation
- ✅ Saving redirects to today page
- ✅ Today page shows custom window
- ✅ Tasks respect custom window boundaries
- ✅ Focus Mode works within custom window
- ✅ Auto-Ripple respects custom end time
- ✅ Settings persist across sessions

---

**Your productivity, your schedule. Configure it your way.** ⚙️
