import React from 'react';
import { Crown, Flame, Gift, Calendar, Clock, Zap } from 'lucide-react';
import { Habit } from '../types';
import { getTodaysScheduledItems } from '../utils/streaks';
import { getCurrentDate } from '../utils/storage';

interface HabitsProps {
  habits: Habit[];
  onCompleteHabit: (habitId: string) => void;
}

const Habits: React.FC<HabitsProps> = ({ habits, onCompleteHabit }) => {
  const todaysHabits = getTodaysScheduledItems(habits);
  const completedToday = todaysHabits.filter(habit => 
    habit.lastCompleted === getCurrentDate()
  ).length;

  const formatTrigger = (trigger: Habit['trigger']) => {
    if (trigger.type === 'time') {
      const [hours, minutes] = trigger.time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } else {
      return `After ${trigger.habitName}`;
    }
  };

  const formatFrequency = (frequency: number[]) => {
    if (frequency.length === 7) return 'Daily';
    if (frequency.length === 5 && !frequency.includes(0) && !frequency.includes(6)) return 'Weekdays';
    if (frequency.length === 2 && frequency.includes(0) && frequency.includes(6)) return 'Weekends';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return frequency.map(d => days[d]).join(', ');
  };

  const getDaysSinceHabit = (becameHabitAt: string) => {
    return Math.floor(
      (new Date().getTime() - new Date(becameHabitAt).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="text-gray-600">Your established patterns of success</p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          <Crown className="w-4 h-4" />
          <span>{habits.length} Habits</span>
        </div>
      </div>

      {/* Today's Progress */}
      {todaysHabits.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-900">Today's Progress</h3>
              <p className="text-yellow-700">
                {completedToday} of {todaysHabits.length} habits maintained
              </p>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {Math.round((completedToday / todaysHabits.length) * 100)}%
            </div>
          </div>
          <div className="mt-2 bg-white rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedToday / todaysHabits.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="flex-1 overflow-y-auto">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits yet</h3>
            <p className="text-gray-600 mb-4">Complete rituals for 60+ days to turn them into habits</p>
            <div className="text-sm text-gray-500">
              Habits are automatically created from successful rituals
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const isScheduledToday = habit.frequency.includes(new Date().getDay());
              const isCompletedToday = habit.lastCompleted === getCurrentDate();
              const canComplete = isScheduledToday && !isCompletedToday;
              const daysSinceHabit = getDaysSinceHabit(habit.becameHabitAt);

              return (
                <div
                  key={habit.id}
                  className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg ${
                    isCompletedToday
                      ? 'border-green-200 bg-green-50'
                      : isScheduledToday
                      ? 'border-yellow-200 hover:border-yellow-300'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                        <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          <Flame className="w-3 h-3" />
                          <span>{habit.streak}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTrigger(habit.trigger)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatFrequency(habit.frequency)}</span>
                        </div>
                        {habit.reward && (
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4" />
                            <span>{habit.reward}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded inline-block">
                        Habit for {daysSinceHabit} days
                      </div>

                      {daysSinceHabit >= 90 && (
                        <div className="mt-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded inline-block ml-2">
                          3+ month streak! 🎉
                        </div>
                      )}
                    </div>

                    {canComplete && (
                      <button
                        onClick={() => onCompleteHabit(habit.id)}
                        className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        Complete
                      </button>
                    )}

                    {isCompletedToday && (
                      <div className="ml-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                        Completed ✓
                      </div>
                    )}

                    {!isScheduledToday && (
                      <div className="ml-4 text-gray-400 text-sm">
                        Not scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Habits;