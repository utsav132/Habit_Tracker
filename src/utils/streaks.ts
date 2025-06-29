import { HabitItem, Ritual, Habit } from '../types';
import { DateManager } from './dateUtils';

export const calculateStreak = (item: HabitItem): number => {
  if (!item.completedDates || item.completedDates.length === 0) {
    return 0;
  }

  const dateManager = DateManager.getInstance();
  const sortedDates = item.completedDates.slice().sort();
  const currentDate = dateManager.getCurrentDate();
  
  let streak = 0;
  let checkDate = new Date(currentDate);
  let frozenStreaksUsed = 0;
  const maxFrozenStreaks = item.frozenStreaks || 0;

  // Start from today and work backwards
  while (checkDate >= new Date(sortedDates[0])) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();
    
    // Check if this day is in the frequency
    if (item.frequency.includes(dayOfWeek)) {
      if (sortedDates.includes(dateStr)) {
        streak++;
      } else {
        // This is a missed day
        // Only break streak if this is a past day (not today)
        if (dateStr < currentDate) {
          // Check if they can use a frozen streak
          if (frozenStreaksUsed < maxFrozenStreaks) {
            frozenStreaksUsed++;
            streak++; // Maintain streak using frozen streak
          } else {
            break; // Streak is broken
          }
        }
        // If it's today and not completed yet, don't break the streak
        // The streak continues until tomorrow if today is missed
      }
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

export const calculateFrozenStreaks = (item: HabitItem): number => {
  if (!item.completedDates || item.completedDates.length === 0) {
    return 0;
  }

  const dateManager = DateManager.getInstance();
  const sortedDates = item.completedDates.slice().sort();
  const currentDate = dateManager.getCurrentDate();
  
  let consecutiveDays = 0;
  let frozenStreaksEarned = 0;
  let checkDate = new Date(currentDate);
  let missedDays = 0;

  // Count consecutive completed days and calculate frozen streaks
  while (checkDate >= new Date(sortedDates[0])) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();
    
    if (item.frequency.includes(dayOfWeek)) {
      if (sortedDates.includes(dateStr)) {
        consecutiveDays++;
        
        // Every 10 consecutive days earns a frozen streak (max 2)
        if (consecutiveDays > 0 && consecutiveDays % 10 === 0 && frozenStreaksEarned < 2) {
          frozenStreaksEarned++;
        }
      } else {
        // Only count as missed if this is a past day (not today)
        if (dateStr < currentDate) {
          missedDays++;
          // Reset consecutive count on missed day
          consecutiveDays = 0;
          // Don't reset frozen streaks immediately - they can be used to cover missed days
        }
      }
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Subtract frozen streaks that would be used to cover missed days
  const frozenStreaksUsed = Math.min(missedDays, frozenStreaksEarned);
  return Math.max(0, frozenStreaksEarned - frozenStreaksUsed);
};

// Calculate streak with frozen streak usage for display purposes
export const calculateStreakWithFrozenUsage = (item: HabitItem): { streak: number; frozenStreaksRemaining: number } => {
  if (!item.completedDates || item.completedDates.length === 0) {
    return { streak: 0, frozenStreaksRemaining: item.frozenStreaks || 0 };
  }

  const dateManager = DateManager.getInstance();
  const sortedDates = item.completedDates.slice().sort();
  const currentDate = dateManager.getCurrentDate();
  
  let streak = 0;
  let checkDate = new Date(currentDate);
  let frozenStreaksUsed = 0;
  const maxFrozenStreaks = item.frozenStreaks || 0;

  // Start from today and work backwards
  while (checkDate >= new Date(sortedDates[0])) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();
    
    // Check if this day is in the frequency
    if (item.frequency.includes(dayOfWeek)) {
      if (sortedDates.includes(dateStr)) {
        streak++;
      } else {
        // This is a missed day
        // Only count as missed if this is a past day (not today)
        if (dateStr < currentDate) {
          // Check if they can use a frozen streak
          if (frozenStreaksUsed < maxFrozenStreaks) {
            frozenStreaksUsed++;
            streak++; // Maintain streak using frozen streak
          } else {
            break; // Streak is broken
          }
        }
        // If it's today and not completed yet, don't break the streak
      }
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { 
    streak, 
    frozenStreaksRemaining: 0 
  };
};

export const shouldPromoteToHabit = (ritual: Ritual): boolean => {
  return ritual.streak >= 20;
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

export const getOtherItems = (items: HabitItem[]): HabitItem[] => {
  const dateManager = DateManager.getInstance();
  const today = dateManager.getCurrentDayOfWeek();
  return items.filter(item => !item.frequency.includes(today));
};