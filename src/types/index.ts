export interface TimeTrigger {
  type: 'time';
  time: string; // HH:MM format
}

export interface HabitTrigger {
  type: 'habit';
  habitId: string;
  habitName: string;
}

export interface BaseHabit {
  id: string;
  name: string;
  trigger: TimeTrigger | HabitTrigger;
  frequency: number[]; // days of week 0-6 (Sunday = 0)
  reward?: string;
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD format
  skipUsed: boolean;
  createdAt: string;
  completedDates: string[]; // Array of YYYY-MM-DD strings
  frozenStreaks: number; // Number of frozen streaks available (max 2)
}

export interface Ritual extends BaseHabit {
  type: 'ritual';
}

export interface Habit extends BaseHabit {
  type: 'habit';
  becameHabitAt: string;
  ritualsToRitualDays?: number; // Track days to potentially become ritual again
}

export interface Task {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export type HabitItem = Ritual | Habit;

export interface AppData {
  rituals: Ritual[];
  habits: Habit[];
  tasks: Task[];
  achievements: Achievement[];
}