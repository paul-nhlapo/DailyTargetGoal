import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Get deals from database (pre-populated, rotates daily)
export async function GET() {
  try {
    const supabase = await createClient()
    const today = new Date().getDay() // 0=Sunday, 6=Saturday
    
    // Get deals for today or generic deals (day_of_week is null)
    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .or(`day_of_week.eq.${today},day_of_week.is.null`)
      .gt('expires_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(5)
    
    if (error) throw error
    
    // If no deals in DB, return fallback
    if (!deals || deals.length === 0) {
      return NextResponse.json({
        deals: getFallbackDeals(),
        source: 'fallback',
        updated: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      deals: deals.map(d => ({
        store: d.store,
        product: d.product,
        discount: d.discount,
        price: d.price,
        url: d.url,
        emoji: d.emoji
      })),
      source: 'database',
      updated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Deals fetch error:', error)
    
    return NextResponse.json({
      deals: getFallbackDeals(),
      source: 'fallback',
      updated: new Date().toISOString()
    })
  }
}

function getFallbackDeals() {
  const today = new Date().getDay()
  const themedDeals = [
    [ // Sunday - Food & Groceries
      { store: 'Woolworths', product: 'Gourmet Meal Kit', discount: '30% OFF', price: 'R149', url: 'https://woolworths.co.za', emoji: '🍽️' },
      { store: 'Pick n Pay', product: 'Fresh Produce Box', discount: 'R50 OFF', price: 'R99', url: 'https://pnp.co.za', emoji: '🥗' },
      { store: 'Checkers', product: 'Wine Special', discount: '40% OFF', price: 'R89', url: 'https://checkers.co.za', emoji: '🍷' },
    ],
    [ // Monday - Tech & Gadgets
      { store: 'Takealot', product: 'Wireless Earbuds', discount: '40% OFF', price: 'R299', url: 'https://takealot.com', emoji: '🎧' },
      { store: 'Incredible Connection', product: 'Gaming Mouse', discount: '35% OFF', price: 'R399', url: 'https://ic.co.za', emoji: '🖱️' },
      { store: 'Evetech', product: 'Mechanical Keyboard', discount: '25% OFF', price: 'R899', url: 'https://evetech.co.za', emoji: '⌨️' },
    ],
    [ // Tuesday - Fashion & Apparel
      { store: 'Superbalist', product: 'Designer Sneakers', discount: '50% OFF', price: 'R599', url: 'https://superbalist.com', emoji: '👟' },
      { store: 'Zando', product: 'Summer Dresses', discount: '40% OFF', price: 'R299', url: 'https://zando.co.za', emoji: '👗' },
      { store: 'Cotton On', product: 'Casual Wear Bundle', discount: '3 for R300', price: 'R300', url: 'https://cottonon.com', emoji: '👕' },
    ],
    [ // Wednesday - Health & Wellness
      { store: 'Dis-Chem', product: 'Vitamin Bundle', discount: '25% OFF', price: 'R199', url: 'https://dischem.co.za', emoji: '💊' },
      { store: 'Clicks', product: 'Skincare Set', discount: '30% OFF', price: 'R249', url: 'https://clicks.co.za', emoji: '🧴' },
      { store: 'Sportscene', product: 'Yoga Mat + Blocks', discount: '40% OFF', price: 'R299', url: 'https://sportscene.co.za', emoji: '🧘' },
    ],
    [ // Thursday - Home & Living
      { store: 'Makro', product: 'Coffee Machine', discount: '30% OFF', price: 'R1,499', url: 'https://makro.co.za', emoji: '☕' },
      { store: 'Game', product: 'Bedding Set', discount: '40% OFF', price: 'R599', url: 'https://game.co.za', emoji: '🛏️' },
      { store: 'Takealot', product: 'Air Fryer', discount: '35% OFF', price: 'R899', url: 'https://takealot.com', emoji: '🍳' },
    ],
    [ // Friday - Entertainment & Leisure
      { store: 'OneDayOnly', product: 'Bluetooth Speaker', discount: '50% OFF', price: 'R499', url: 'https://onedayonly.co.za', emoji: '🔊' },
      { store: 'Takealot', product: 'Board Games Bundle', discount: '30% OFF', price: 'R399', url: 'https://takealot.com', emoji: '🎲' },
      { store: 'Game', product: 'Camping Gear', discount: '40% OFF', price: 'R799', url: 'https://game.co.za', emoji: '⛺' },
    ],
    [ // Saturday - Sports & Fitness
      { store: 'Sportscene', product: 'Running Shoes', discount: '45% OFF', price: 'R699', url: 'https://sportscene.co.za', emoji: '🏃' },
      { store: 'Totalsports', product: 'Gym Bag + Bottle', discount: '35% OFF', price: 'R299', url: 'https://totalsports.co.za', emoji: '🏀' },
      { store: 'Mr Price Sport', product: 'Activewear Set', discount: '40% OFF', price: 'R399', url: 'https://mrpricesport.com', emoji: '🏋️' },
    ],
  ]
  
  return themedDeals[today] || themedDeals[1]
}
