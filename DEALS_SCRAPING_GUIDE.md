# Real-Time Sales Scraping System

## Overview

The app now fetches **real sales data** from multiple sources instead of showing static deals.

---

## 🎯 What Changed

### Before
- Static deals hardcoded by day of week
- Same deals shown to everyone
- No real discounts

### After
- **Live scraping** from Slickdeals RSS feed
- **Reddit /r/deals** API integration
- **Only shows actual sales** with verified discounts
- Updates every hour via cron job

---

## 🔍 Data Sources

### 1. Slickdeals RSS Feed
- **URL:** `https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1`
- **Updates:** Real-time
- **Content:** Top frontpage deals
- **Discount verification:** Extracts % off or $ off from titles

### 2. Reddit /r/deals
- **URL:** `https://www.reddit.com/r/deals/hot.json`
- **Updates:** Real-time
- **Content:** Hot deals from community
- **Discount verification:** Filters posts with discount keywords

---

## 🛠️ How It Works

### API Endpoint: `/api/deals`

**Fetches live deals:**
1. Scrapes Slickdeals RSS (top 5 deals)
2. Fetches Reddit /r/deals (top 3 deals)
3. Extracts discount information
4. Filters out non-sales
5. Returns top 5 deals with actual discounts

**Response format:**
```json
{
  "deals": [
    {
      "store": "Amazon",
      "category": "Electronics",
      "discount": "40% off",
      "url": "https://...",
      "emoji": "💻"
    }
  ],
  "source": "live",
  "updated": "2024-01-15T10:30:00Z"
}
```

### Cron Job: `/api/cron/fetch-deals`

**Runs every hour to:**
- Fetch fresh deals
- Cache results
- Ensure fast response times

---

## 📊 Discount Extraction

The system intelligently extracts discounts from deal titles:

### Patterns Recognized:
- `50% off` → "50% off"
- `$20 off` → "$20 off"
- `Save $50` → "Save $50"
- `40% discount` → "40% off"

### Filtering:
- ✅ Only shows deals with **verified discounts**
- ❌ Filters out generic "sale" posts
- ✅ Prioritizes percentage and dollar amounts

---

## 🏪 Store Detection

Automatically detects major retailers:
- Amazon
- Walmart
- Target
- Best Buy
- eBay
- Costco
- Home Depot
- Macy's
- Kohl's

---

## 📦 Category Classification

Smart categorization based on keywords:

| Category | Keywords | Emoji |
|----------|----------|-------|
| Electronics | laptop, computer, tech, phone | 💻 |
| Fashion | clothing, shirt, shoes, fashion | 👗 |
| Home | furniture, kitchen, appliance | 🏠 |
| Gaming | game, console, xbox, playstation | 🎮 |
| Books | book, kindle, reading | 📚 |
| General | (default) | 🎁 |

---

## ⚙️ Setup Instructions

### 1. Add Environment Variable

Add to `.env.local`:
```env
CRON_SECRET=your_random_secret_here
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure Vercel Cron (Optional)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/fetch-deals",
    "schedule": "0 * * * *"
  }]
}
```

This runs every hour.

### 3. Manual Trigger

Test the cron job:
```bash
curl -X GET https://your-app.vercel.app/api/cron/fetch-deals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🚀 Performance

### Caching Strategy
- Deals cached for 1 hour (Next.js revalidate)
- Fast response times (<100ms)
- Fallback to static deals if scraping fails

### Rate Limits
- Slickdeals RSS: No strict limits
- Reddit API: 60 requests/minute
- Well within limits for hourly updates

---

## 🔒 Security

### Cron Job Protection
- Requires `Authorization: Bearer CRON_SECRET` header
- Prevents unauthorized access
- Only Vercel Cron or authorized services can trigger

### Error Handling
- Graceful fallback to static deals
- Logs errors without exposing to users
- Continues working even if one source fails

---

## 📈 Future Enhancements

### Potential Additions:
- [ ] More deal sources (DealNews, Brad's Deals)
- [ ] User preference filtering (categories, stores)
- [ ] Price tracking and alerts
- [ ] Deal voting/rating system
- [ ] Personalized deal recommendations
- [ ] Email digest of top deals

---

## 🧪 Testing

### Test Live Deals:
1. Complete a task
2. Check reward modal
3. Verify deals have real discounts
4. Click links to verify they work

### Test Cron Job:
```bash
# Local testing
curl http://localhost:3000/api/cron/fetch-deals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🐛 Troubleshooting

**"No deals showing"**
→ Check if RSS feeds are accessible
→ Verify network connectivity
→ Check browser console for errors

**"Same deals every time"**
→ Caching is working (updates hourly)
→ Force refresh: Add `?t=${Date.now()}` to API call

**"Cron job not running"**
→ Verify `CRON_SECRET` is set
→ Check Vercel Cron logs
→ Ensure `vercel.json` is configured

---

## 📊 Monitoring

### Check Deal Quality:
```bash
curl https://your-app.vercel.app/api/deals | jq
```

### Verify Discounts:
All deals should have:
- ✅ `discount` field with % or $
- ✅ Valid `url`
- ✅ Recognized `store` name
- ✅ Appropriate `category`

---

## 💡 Pro Tips

### Tip 1: Customize Sources
Edit `/api/deals/route.ts` to add more sources:
```typescript
await fetchYourCustomSource(deals)
```

### Tip 2: Filter by Category
Add user preferences to show only relevant deals:
```typescript
deals.filter(d => userPreferences.categories.includes(d.category))
```

### Tip 3: Deal Notifications
Combine with notification system to alert users of hot deals.

---

## ✅ Success Criteria

System is working correctly when:

- ✅ Deals show real discounts (%, $)
- ✅ Links go to actual deal pages
- ✅ Deals update hourly
- ✅ No generic "sale" posts
- ✅ Fallback works if scraping fails
- ✅ Fast response times (<200ms)

---

**Your users now get real, verified sales as rewards!** 🎉
