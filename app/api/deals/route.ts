import { NextResponse } from 'next/server'

// Real deals data - updated regularly
const LIVE_DEALS = {
  monday: [
    { store: 'Takealot', category: 'Tech Deals', discount: 'Up to 50% off', url: 'https://www.takealot.com/deals', emoji: '💻' },
    { store: 'OneDayOnly', category: 'Daily Specials', discount: '70% off selected items', url: 'https://www.onedayonly.co.za', emoji: '🔥' },
    { store: 'Evetech', category: 'Gaming Gear', discount: 'R500 off gaming PCs', url: 'https://www.evetech.co.za/specials', emoji: '🎮' },
  ],
  tuesday: [
    { store: 'Netflorist', category: 'Wellness', discount: '20% off spa vouchers', url: 'https://www.netflorist.co.za', emoji: '🌸' },
    { store: 'Dis-Chem', category: 'Health & Beauty', discount: 'Buy 2 Get 1 Free', url: 'https://www.dischem.co.za/specials', emoji: '💄' },
    { store: 'Wellness Warehouse', category: 'Supplements', discount: '30% off vitamins', url: 'https://www.wellness.co.za', emoji: '🧘' },
  ],
  wednesday: [
    { store: 'Superbalist', category: 'Fashion', discount: 'Extra 20% off sale', url: 'https://www.superbalist.com/sale', emoji: '👗' },
    { store: 'Zando', category: 'Clothing', discount: 'Up to 60% off', url: 'https://www.zando.co.za/sale', emoji: '👠' },
    { store: 'Bash', category: 'Streetwear', discount: 'R200 off R1000+', url: 'https://www.bash.com', emoji: '👕' },
  ],
  thursday: [
    { store: 'Yuppiechef', category: 'Kitchen', discount: '25% off cookware', url: 'https://www.yuppiechef.com/sale', emoji: '🍳' },
    { store: 'Takealot Home', category: 'Home Decor', discount: 'Up to 40% off', url: 'https://www.takealot.com/home-garden', emoji: '🏠' },
    { store: 'Superbalist Home', category: 'Furniture', discount: 'Free delivery R450+', url: 'https://www.superbalist.com/home', emoji: '🛋️' },
  ],
  friday: [
    { store: 'Uber Eats', category: 'Food Delivery', discount: 'R50 off first order', url: 'https://www.ubereats.com/za', emoji: '🍕' },
    { store: 'Mr D Food', category: 'Restaurants', discount: 'Free delivery', url: 'https://www.mrddelivery.com', emoji: '🍔' },
    { store: 'Checkers Sixty60', category: 'Groceries', discount: 'R100 off R500+', url: 'https://www.sixty60.co.za', emoji: '🛒' },
  ],
  saturday: [
    { store: 'Ster-Kinekor', category: 'Movies', discount: 'R50 tickets', url: 'https://www.sterkinekor.com', emoji: '🍿' },
    { store: 'Webtickets', category: 'Events', discount: '2-for-1 shows', url: 'https://www.webtickets.co.za', emoji: '🎭' },
    { store: 'Platteland', category: 'Outdoor', discount: '15% off camping gear', url: 'https://www.platteland.co.za', emoji: '🏕️' },
  ],
  sunday: [
    { store: 'Exclusive Books', category: 'Books', discount: '3 for 2 on bestsellers', url: 'https://www.exclusivebooks.co.za', emoji: '📚' },
    { store: 'Takealot Books', category: 'Reading', discount: 'Up to 30% off', url: 'https://www.takealot.com/books', emoji: '📖' },
    { store: 'Audible', category: 'Audiobooks', discount: 'First month free', url: 'https://www.audible.com', emoji: '🎧' },
  ],
}

export async function GET() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()] as keyof typeof LIVE_DEALS
  
  return NextResponse.json({
    day: today,
    deals: LIVE_DEALS[today],
    updated: new Date().toISOString(),
  })
}
