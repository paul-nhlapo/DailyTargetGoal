// Notification utility functions
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

export function showTaskNotification(taskTitle: string, minutesBefore: number) {
  if (Notification.permission === 'granted') {
    const message = minutesBefore === 0 
      ? `Starting now!` 
      : `Starts in ${minutesBefore} minutes`
    
    new Notification(`🎯 ${taskTitle}`, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: minutesBefore === 0,
      tag: `task-${taskTitle}-${minutesBefore}`
    })
  }
}

export function scheduleTaskNotification(
  taskTitle: string,
  startTime: Date,
  minutesBefore: number
): NodeJS.Timeout | null {
  const notificationTime = new Date(startTime.getTime() - minutesBefore * 60000)
  const delay = notificationTime.getTime() - Date.now()

  if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
    return setTimeout(() => {
      showTaskNotification(taskTitle, minutesBefore)
    }, delay)
  }

  return null
}
