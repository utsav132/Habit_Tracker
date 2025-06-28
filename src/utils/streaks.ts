import { HabitItem, Ritual, Habit } from '../types';
import { DateManager } from './dateUtils';

export const calculateStreak = (item: HabitItem): number => {
  if (!item.completedDates || item.completedDates.length === 0) {
    return 0;
  }

  const dateManager = DateManager.getInstance();
  const sortedDates = item.completedDates.slice().sort();
  const today = dateManager.isDevMode() 
    ? new Date(dateManager.getCurrentDate()) 
    : new Date();
  let streak = 0;
  let currentDate = new Date(today);

  // Start from today and work backwards
  while (currentDate >= new Date(sortedDates[0])) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    
    // Check if this day is in the frequency
    if (item.frequency.includes(dayOfWeek)) {
      if (sortedDates.includes(dateStr)) {
        streak++;
      } else {
        // Check if they can use a skip
        if (streak >= 10 && !item.skipUsed) {
          // They can skip this day
          streak++;
        } else {
          break;
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

export const shouldPromoteToHabit = (ritual: Ritual): boolean => {
  return ritual.streak >= 60;
};

export const shouldDemoteToRitual = (habit: Habit): boolean => {
  // If streak is broken and they haven't regained 20+ streak in 25 days
  if (habit.streak === 0) {
    const daysSinceBecameHabit = Math.floor(
      (new Date().getTime() - new Date(habit.becameHabitAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceBecameHabit > 25 && habit.streak < 20) {
      return true;
    }
  }
  
  return false;
};

export const canUseSkip = (item: HabitItem): boolean => {
  return item.streak >= 10 && !item.skipUsed;
};

export const getTodaysScheduledItems = (items: HabitItem[]): HabitItem[] => {
  const dateManager = DateManager.getInstance();
  const today = dateManager.getCurrentDayOfWeek();
  return items.filter(item => item.frequency.includes(today));
};