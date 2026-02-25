// Combined rewards: Motivation + Real scraped deals
export function getDailyReward() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  
  const rewards = {
    monday: {
      title: "💪 Monday Warrior!",
      message: "You crushed it! Starting the week strong.",
      quote: "The secret of getting ahead is getting started.",
      color: "from-blue-900/50 to-purple-900/50",
      emoji: "🚀"
    },
    tuesday: {
      title: "🔥 On Fire!",
      message: "Two days down! You're building momentum.",
      quote: "Success is the sum of small efforts repeated daily.",
      color: "from-orange-900/50 to-red-900/50",
      emoji: "⚡"
    },
    wednesday: {
      title: "🎯 Halfway Hero!",
      message: "Midweek champion! Keep pushing forward.",
      quote: "The only way to do great work is to love what you do.",
      color: "from-green-900/50 to-teal-900/50",
      emoji: "🌟"
    },
    thursday: {
      title: "💎 Almost There!",
      message: "Thursday triumph! The weekend is in sight.",
      quote: "Don't watch the clock; do what it does. Keep going.",
      color: "from-purple-900/50 to-pink-900/50",
      emoji: "👑"
    },
    friday: {
      title: "🎉 Friday Champion!",
      message: "You made it! What an incredible week.",
      quote: "The harder you work, the luckier you get.",
      color: "from-yellow-900/50 to-orange-900/50",
      emoji: "🏆"
    },
    saturday: {
      title: "🌈 Weekend Warrior!",
      message: "Saturday success! You're unstoppable.",
      quote: "Your limitation—it's only your imagination.",
      color: "from-indigo-900/50 to-blue-900/50",
      emoji: "✨"
    },
    sunday: {
      title: "🌟 Sunday Star!",
      message: "Even on Sunday! That's dedication.",
      quote: "Great things never come from comfort zones.",
      color: "from-pink-900/50 to-purple-900/50",
      emoji: "💫"
    }
  }
  
  return rewards[today as keyof typeof rewards]
}

export function getStreakBonus(completedToday: number) {
  if (completedToday >= 10) {
    return {
      title: "🔥 LEGENDARY STREAK!",
      message: `${completedToday} tasks completed today! You're a productivity machine!`,
      bonus: "10x Productivity Multiplier"
    }
  } else if (completedToday >= 5) {
    return {
      title: "⚡ SUPER STREAK!",
      message: `${completedToday} tasks done! You're on fire!`,
      bonus: "5x Productivity Boost"
    }
  } else if (completedToday >= 3) {
    return {
      title: "🌟 GREAT STREAK!",
      message: `${completedToday} tasks completed! Keep it up!`,
      bonus: "3x Momentum Builder"
    }
  }
  return null
}

export function getMotivationalTip() {
  const tips = [
    "💡 Pro tip: Take a 5-minute break before your next task!",
    "🧠 Remember: Small progress is still progress.",
    "⏰ Time blocking works! You're proving it right now.",
    "🎯 Focus on one task at a time. You're doing great!",
    "💪 Every completed task is a win. Celebrate it!",
    "🚀 You're building momentum. Keep going!",
    "✨ Consistency beats perfection. You're consistent!",
    "🔥 Your future self will thank you for this work.",
    "🌟 You're not just completing tasks, you're building habits.",
    "⚡ Energy follows action. You're creating energy!"
  ]
  
  return tips[Math.floor(Math.random() * tips.length)]
}
