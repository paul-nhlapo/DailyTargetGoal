export const DEALS_BY_DAY = {
  monday: [
    { store: 'OneDayOnly', category: 'Tech & Electronics', url: 'https://www.onedayonly.co.za', emoji: '💻' },
    { store: 'Takealot', category: 'Cyber Monday Deals', url: 'https://www.takealot.com/deals', emoji: '🛒' },
    { store: 'Evetech', category: 'Gaming & PC Deals', url: 'https://www.evetech.co.za/specials', emoji: '🎮' },
  ],
  tuesday: [
    { store: 'Netflorist', category: 'Self-Care & Wellness', url: 'https://www.netflorist.co.za', emoji: '🌸' },
    { store: 'Takealot Beauty', category: 'Beauty & Health', url: 'https://www.takealot.com/beauty', emoji: '💄' },
    { store: 'Wellness Warehouse', category: 'Health Products', url: 'https://www.wellness.co.za', emoji: '🧘' },
  ],
  wednesday: [
    { store: 'FOMO', category: 'Fashion & Lifestyle', url: 'https://www.fomo.co.za', emoji: '👗' },
    { store: 'Superbalist', category: 'Clothing Deals', url: 'https://www.superbalist.com/sale', emoji: '👕' },
    { store: 'Zando', category: 'Fashion Sale', url: 'https://www.zando.co.za/sale', emoji: '👠' },
  ],
  thursday: [
    { store: 'Takealot', category: 'Home & Living', url: 'https://www.takealot.com/home-garden', emoji: '🏠' },
    { store: 'OneDayOnly', category: 'Home Essentials', url: 'https://www.onedayonly.co.za', emoji: '🛋️' },
    { store: 'Yuppiechef', category: 'Kitchen & Dining', url: 'https://www.yuppiechef.com/sale', emoji: '🍳' },
  ],
  friday: [
    { store: 'Uber Eats', category: 'Food Delivery Deals', url: 'https://www.ubereats.com/za', emoji: '🍕' },
    { store: 'Mr D Food', category: 'Restaurant Specials', url: 'https://www.mrddelivery.com', emoji: '🍔' },
    { store: 'Checkers Sixty60', category: 'Grocery Deals', url: 'https://www.sixty60.co.za', emoji: '🛒' },
  ],
  saturday: [
    { store: 'Webtickets', category: 'Entertainment & Events', url: 'https://www.webtickets.co.za', emoji: '🎬' },
    { store: 'Computicket', category: 'Shows & Concerts', url: 'https://www.computicket.com', emoji: '🎭' },
    { store: 'Ster-Kinekor', category: 'Movie Deals', url: 'https://www.sterkinekor.com', emoji: '🍿' },
  ],
  sunday: [
    { store: 'Takealot', category: 'Books & Media', url: 'https://www.takealot.com/books', emoji: '📚' },
    { store: 'Exclusive Books', category: 'Reading Deals', url: 'https://www.exclusivebooks.co.za', emoji: '📖' },
    { store: 'Audible', category: 'Audiobooks', url: 'https://www.audible.com', emoji: '🎧' },
  ],
}

export function getTodayDeals() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  return DEALS_BY_DAY[today as keyof typeof DEALS_BY_DAY] || DEALS_BY_DAY.monday
}
