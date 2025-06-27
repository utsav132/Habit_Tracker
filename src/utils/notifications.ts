export class NotificationManager {
  private static instance: NotificationManager;
  private scheduledNotifications: Map<string, number> = new Map();

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  scheduleRitualNotification(ritual: any): void {
    if (!this.canSendNotifications()) return;

    // Clear existing notification for this ritual
    this.clearNotification(ritual.id);

    if (ritual.trigger.type === 'time') {
      this.scheduleTimeBasedNotification(ritual);
    }
    // Habit-based triggers are handled when the triggering habit is completed
  }

  private scheduleTimeBasedNotification(ritual: any): void {
    const now = new Date();
    const [hours, minutes] = ritual.trigger.time.split(':').map(Number);
    
    // Check if ritual is scheduled for today
    if (!ritual.frequency.includes(now.getDay())) {
      return;
    }

    // Check if already completed today
    const today = now.toISOString().split('T')[0];
    if (ritual.lastCompleted === today) {
      return;
    }

    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow (if applicable)
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
      // Check if ritual is scheduled for tomorrow
      if (!ritual.frequency.includes(notificationTime.getDay())) {
        return;
      }
    }

    const timeUntilNotification = notificationTime.getTime() - now.getTime();
    
    const timeoutId = window.setTimeout(() => {
      this.sendNotification(
        `Time for ${ritual.name}!`,
        `It's time to complete your ritual: ${ritual.name}`,
        'ritual'
      );
      this.scheduledNotifications.delete(ritual.id);
    }, timeUntilNotification);

    this.scheduledNotifications.set(ritual.id, timeoutId);
  }

  sendHabitTriggerNotification(triggeringHabitName: string, triggeredRituals: any[]): void {
    if (!this.canSendNotifications() || triggeredRituals.length === 0) return;

    const ritualNames = triggeredRituals.map(r => r.name).join(', ');
    this.sendNotification(
      `Time for your next rituals!`,
      `After completing ${triggeringHabitName}, don't forget: ${ritualNames}`,
      'habit-trigger'
    );
  }

  sendRewardNotification(title: string, message: string): void {
    if (!this.canSendNotifications()) return;
    this.sendNotification(title, message, 'reward');
  }

  sendAchievementNotification(achievementName: string): void {
    if (!this.canSendNotifications()) return;
    this.sendNotification(
      '🏆 Achievement Unlocked!',
      `Congratulations! You've earned: ${achievementName}`,
      'achievement'
    );
  }

  private sendNotification(title: string, body: string, tag: string): void {
    if (!this.canSendNotifications()) return;

    new Notification(title, {
      body,
      tag,
      icon: '/vite.svg', // You can replace with a custom icon
      badge: '/vite.svg',
      requireInteraction: false,
      silent: false,
    });
  }

  private canSendNotifications(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  clearNotification(id: string): void {
    const timeoutId = this.scheduledNotifications.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(id);
    }
  }

  clearAllNotifications(): void {
    this.scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
    this.scheduledNotifications.clear();
  }

  rescheduleAllRituals(rituals: any[]): void {
    this.clearAllNotifications();
    rituals.forEach(ritual => this.scheduleRitualNotification(ritual));
  }
}