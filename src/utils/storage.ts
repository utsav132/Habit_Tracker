import { AppData, Achievement, Ritual, Habit, Task } from '../types';

const STORAGE_KEY = 'habit-tracker-data';

const initialAchievements: Achievement[] = [
  {
    id: 'start-ritual',
    name: 'First Steps',
    description: 'Start your first ritual',
    icon: 'Zap',
    unlocked: false,
  },
  {
    id: 'ritual-to-habit',
    name: 'Habit Former',
    description: 'Turn a ritual into a habit (60+ day streak)',
    icon: 'Trophy',
    unlocked: false,
  },
  {
    id: 'habit-3-months',
    name: 'Consistency Master',
    description: 'Maintain a habit for 3 months',
    icon: 'Calendar',
    unlocked: false,
  },
  {
    id: 'five-habits',
    name: 'Habit Collector',
    description: 'Create 5 habits',
    icon: 'Star',
    unlocked: false,
  },
  {
    id: 'complete-task',
    name: 'Task Warrior',
    description: 'Complete your first task',
    icon: 'CheckCircle',
    unlocked: false,
  },
  {
    id: 'complete-all-tasks',
    name: 'Daily Champion',
    description: 'Complete all tasks in a day',
    icon: 'Target',
    unlocked: false,
  },
  {
    id: 'complete-all-rituals',
    name: 'Ritual Master',
    description: 'Complete all rituals in a day',
    icon: 'Crown',
    unlocked: false,
  },
  {
    id: 'ritual-streak-15',
    name: 'Dedication Legend',
    description: 'Complete all rituals daily for 15 days straight',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 15,
  },
];

export const getStoredData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        rituals: data.rituals || [],
        habits: data.habits || [],
        tasks: data.tasks || [],
        achievements: data.achievements || initialAchievements,
      };
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
  
  return {
    rituals: [],
    habits: [],
    tasks: [],
    achievements: initialAchievements,
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Re-export from dateUtils for backward compatibility
export { getCurrentDate, getYesterdayDate, getTomorrowDate, isToday, formatDate } from './dateUtils';