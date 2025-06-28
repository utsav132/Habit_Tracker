import { AppData, Achievement, HabitItem } from '../types';
import { DateManager } from './dateUtils';

export const checkAchievements = (data: AppData): Achievement[] => {
  const dateManager = DateManager.getInstance();
  const currentDate = dateManager.getCurrentDate();
  const yesterdayDate = dateManager.getYesterdayDate();

  const updatedAchievements = data.achievements.map(achievement => {
    if (achievement.unlocked) return achievement;

    switch (achievement.id) {
      case 'start-ritual':
        if (data.rituals.length > 0) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'ritual-to-habit':
        if (data.habits.length > 0) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'habit-3-months':
        const hasThreeMonthHabit = data.habits.some(habit => {
          const daysSinceBecame = Math.floor(
            (new Date().getTime() - new Date(habit.becameHabitAt).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          return daysSinceBecame >= 90;
        });
        if (hasThreeMonthHabit) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'five-habits':
        if (data.habits.length >= 5) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'complete-task':
        if (data.tasks.some(task => task.completed)) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'complete-all-tasks':
        // Check if all tasks were completed yesterday (to avoid same-day additions)
        const yesterdaysTasks = data.tasks.filter(task => task.date === yesterdayDate);
        if (yesterdaysTasks.length > 0 && yesterdaysTasks.every(task => task.completed)) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'complete-all-rituals':
        // Check if all rituals were completed yesterday
        const yesterdayDate2 = new Date();
        yesterdayDate2.setDate(yesterdayDate2.getDate() - 1);
        const yesterdayDayOfWeek = yesterdayDate2.getDay();
        
        const yesterdaysRituals = data.rituals.filter(ritual => 
          ritual.frequency.includes(yesterdayDayOfWeek)
        );
        if (yesterdaysRituals.length > 0 && 
            yesterdaysRituals.every(ritual => ritual.completedDates?.includes(yesterdayDate))) {
          return { ...achievement, unlocked: true, unlockedAt: currentDate };
        }
        break;

      case 'ritual-streak-15':
        const progress = calculateConsecutiveAllRitualDays(data.rituals);
        const updated = { ...achievement, progress };
        if (progress >= 15) {
          updated.unlocked = true;
          updated.unlockedAt = currentDate;
        }
        return updated;
    }

    return achievement;
  });

  return updatedAchievements;
};

const calculateConsecutiveAllRitualDays = (rituals: HabitItem[]): number => {
  if (rituals.length === 0) return 0;

  let consecutiveDays = 0;
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) { // Start from yesterday
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayOfWeek = checkDate.getDay();
    
    const todaysRituals = rituals.filter(ritual => ritual.frequency.includes(dayOfWeek));
    
    if (todaysRituals.length === 0) {
      continue; // Skip days with no scheduled rituals
    }
    
    const allCompleted = todaysRituals.every(ritual => 
      ritual.completedDates?.includes(dateStr)
    );
    
    if (allCompleted) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  return consecutiveDays;
};