# Elite Features - Quick Reference

Visual guide to the three elite productivity features.

---

## 🔄 Auto-Ripple Logic

### When to Use
Task is running over and you need to extend it without breaking your schedule.

### Visual Indicator
```
┌─────────────────────────────────────┐
│ Task: Write Report                  │
│ ⏰ 9:00 AM – 10:00 AM (60 min)     │
│                                     │
│ [⏪ -15m] [+15m ⏩] [🔄 +15m & Ripple] │
└─────────────────────────────────────┘
```

### What Happens
**Before:**
```
9:00 - 10:00  Write Report
10:00 - 11:00 Team Meeting
11:00 - 12:00 Code Review
```

**Click "🔄 +15m & Ripple":**
```
9:00 - 10:15  Write Report  ← Extended
10:15 - 11:15 Team Meeting  ← Auto-shifted
11:15 - 12:15 Code Review   ← Auto-shifted
```

### Button Location
In each task card, when time is set, look for:
- `🔄 +15m & Ripple` button (blue)

---

## 🎯 Focus Mode

### When to Use
You're within a task's time window and want distraction-free work.

### Visual Indicator - Entry Point
```
┌─────────────────────────────────────────────┐
│ Current Task                                │
│ Write Report                                │
│                    [🎯 Enter Focus Mode]    │
└─────────────────────────────────────────────┘
```

### Focus Mode Screen
```
╔═══════════════════════════════════════════╗
║                                           ║
║              🎯                           ║
║         Write Report                      ║
║      9:00 AM – 10:00 AM                  ║
║                                           ║
║         ┌─────────────┐                  ║
║         │    45:23    │                  ║
║         │Time Remaining│                 ║
║         └─────────────┘                  ║
║                                           ║
║  [⏸️ Pause] [✓ Complete Task]           ║
║                                           ║
╚═══════════════════════════════════════════╝
```

### How to Enter
1. Wait until current time is within a task's scheduled window
2. Look for purple "Current Task" card at top
3. Click **"🎯 Enter Focus Mode"**

### How to Exit
- Click **"✕ Exit Focus"** (top-right corner)
- Or complete the task

---

## ⏸️ Interference Tracking (Reality Audit)

### When to Use
Anytime you're interrupted by something unplanned.

### Visual Indicator - Reality Audit Card
```
┌─────────────────────────────────────────────┐
│ Reality Audit                               │
│ 45m lost to interruptions                   │
│                    [⏸️ Log Interference]    │
└─────────────────────────────────────────────┘
```

### During Interference
```
┌─────────────────────────────────────────────┐
│ Reality Audit                               │
│ 45m lost to interruptions                   │
│              [▶️ End Interference] ← Pulsing│
└─────────────────────────────────────────────┘
```

### Interference Log
```
┌─────────────────────────────────────────────┐
│ Reality Audit                               │
│ 87m lost to interruptions                   │
│                                             │
│ ▼ View interference log (5)                │
│   ┌─────────────────────────────────────┐  │
│   │ 25m - Emergency client call         │  │
│   │ 15m - Coffee + bathroom break       │  │
│   │ 12m - Slack messages                │  │
│   │ 20m - Unexpected meeting            │  │
│   │ 15m - Email firefighting            │  │
│   └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Workflow
1. **Interrupted?** → Click **"⏸️ Log Interference"**
2. **Handle interruption** (button pulses green)
3. **Done?** → Click **"▶️ End Interference"**
4. **Enter reason** → Type what interrupted you
5. **View log** → Click "View interference log" to see all

---

## 🎮 Complete Workflow Example

### Morning: Planning
```
6:00 AM - Add tasks for the day
        - Set time blocks
        - Review yesterday's Reality Audit
```

### 9:00 AM: Deep Work
```
┌─────────────────────────────────────────────┐
│ Current Task: Write Report                  │
│                    [🎯 Enter Focus Mode]    │
└─────────────────────────────────────────────┘
                      ↓ Click
╔═══════════════════════════════════════════╗
║         Write Report                      ║
║            60:00                          ║
║        Time Remaining                     ║
╚═══════════════════════════════════════════╝
```

### 9:30 AM: Interruption
```
Phone rings → Click [⏸️ Pause (Interference)]
Handle call (10 minutes)
Click [▶️ Resume]
Enter: "Emergency client call"
```

### 10:00 AM: Task Overruns
```
Need 15 more minutes → Click [🔄 +15m & Ripple]
All subsequent tasks auto-shift
Continue working until 10:15 AM
```

### 10:00 PM: Day Review
```
┌─────────────────────────────────────────────┐
│ Reality Audit                               │
│ 87m lost to interruptions                   │
│                                             │
│ ▼ View interference log (5)                │
│   - 25m Emergency client call               │
│   - 15m Coffee break                        │
│   - 12m Slack messages                      │
│   - 20m Unexpected meeting                  │
│   - 15m Email firefighting                  │
└─────────────────────────────────────────────┘

Effective Hours: 14h 33m (out of 16h)
Tasks Completed: 8/10
```

---

## 🎯 Button Quick Reference

| Button | Location | Function |
|--------|----------|----------|
| `🎯 Enter Focus Mode` | Current Task card (purple) | Enter full-screen focus view |
| `✕ Exit Focus` | Focus Mode (top-right) | Return to task list |
| `🔄 +15m & Ripple` | Task card (blue button) | Extend task + auto-shift others |
| `⏸️ Log Interference` | Reality Audit card (amber) | Start tracking interruption |
| `▶️ End Interference` | Reality Audit card (green, pulsing) | Stop tracking + log reason |
| `⏸️ Pause (Interference)` | Focus Mode | Pause focus + log interruption |
| `▶️ Resume` | Focus Mode (during interference) | Resume focus + log reason |

---

## 🎨 Color Coding

| Color | Meaning |
|-------|---------|
| 🟣 Purple | Focus Mode / Current Task |
| 🔵 Blue | Auto-Ripple actions |
| 🟡 Amber | Interference tracking |
| 🟢 Green | Active states / Resume |
| 🔴 Red | Stop / Delete actions |

---

## ⚡ Pro Tips

### Tip 1: Focus Mode Trigger
Focus Mode button only appears when you're within a task's time window. If you don't see it, check your task times.

### Tip 2: Auto-Ripple Strategy
Use regular `+15m` for small adjustments. Use `🔄 +15m & Ripple` when you have tasks scheduled after.

### Tip 3: Interference Threshold
Only log interruptions over 3 minutes. Smaller ones are noise.

### Tip 4: Reality Audit Review
Check your interference log at end of day. Look for patterns to eliminate.

### Tip 5: Focus Mode Duration
Optimal: 60-90 minute blocks. Take 10-minute breaks between sessions.

---

## 🚨 Troubleshooting

### "I don't see the Focus Mode button"
✅ Make sure current time is within a task's scheduled window
✅ Task must have start_time and end_time set
✅ Task must not be completed

### "Auto-Ripple pushed my task past 10 PM"
✅ This means you overcommitted for the day
✅ Defer the last task to tomorrow
✅ Or compress/remove a less important task

### "Interference button is stuck pulsing"
✅ Click "▶️ End Interference" to stop tracking
✅ Enter a reason when prompted
✅ If stuck, refresh the page

### "My Reality Audit shows 6+ hours lost"
✅ This is your baseline - now you know the truth
✅ Use this data to set boundaries
✅ Schedule buffer time for expected interruptions
✅ Aim to reduce by 10% per week

---

## 📱 Mobile Considerations

All features work on mobile, but Focus Mode is optimized for desktop. On mobile:
- Focus Mode uses full screen
- Buttons are touch-optimized
- Interference tracking works identically

---

## 🎓 Learning Path

**Day 1-3:** Learn the buttons
- Find each button location
- Click through each feature
- Get comfortable with the UI

**Day 4-7:** Use individually
- Try Focus Mode for one task
- Use Auto-Ripple once
- Log a few interferences

**Day 8-14:** Combine features
- Enter Focus Mode for deep work
- Log all interruptions
- Use Auto-Ripple when needed

**Day 15-30:** Master the system
- Focus Mode becomes habit
- Auto-Ripple is automatic
- Reality Audit drives optimization

---

## 🏆 Success Indicators

You're using the features correctly when:

✅ You enter Focus Mode 2-3 times per day
✅ You use Auto-Ripple instead of manual rescheduling
✅ Your Reality Audit shows decreasing interference time weekly
✅ You feel in control of your schedule
✅ You complete high-value work consistently

---

## 📚 Additional Resources

- **[ELITE_FEATURES.md](ELITE_FEATURES.md)** - Comprehensive guide with strategies
- **[README.md](README.md)** - Project overview and setup
- **[QUICK_START.md](QUICK_START.md)** - Get started in 12 minutes

---

**Remember:** These features are tools, not rules. Use what works for you. The goal is elite productivity, not feature completeness.
