import React from 'react';
import { Plus, Clock, Zap, Flame, Gift, Calendar } from 'lucide-react';
import { Ritual, HabitItem } from '../types';
import { getTodaysScheduledItems } from '../utils/streaks';
import { getCurrentDate } from '../utils/storage';

interface RitualsProps {
  rituals: Ritual[];
  onCreateRitual: () => void;
  onCompleteRitual: (ritualId: string) => void;
}

const Rituals: React.FC<RitualsProps> = ({ rituals, onCreateRitual, onCompleteRitual }) => {
  const todaysRituals = getTodaysScheduledItems(rituals);
  const completedToday = todaysRituals.filter(ritual => 
    ritual.lastCompleted === getCurrentDate()
  ).length;

  const formatTrigger = (trigger: Ritual['trigger']) => {
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rituals</h1>
          <p className="text-gray-600">Building your habits, one ritual at a time</p>
        </div>
        <button
          onClick={onCreateRitual}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Ritual</span>
        </button>
      </div>

      {/* Today's Progress */}
      {todaysRituals.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-purple-900">Today's Progress</h3>
              <p className="text-purple-700">
                {completedToday} of {todaysRituals.length} rituals completed
              </p>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((completedToday / todaysRituals.length) * 100)}%
            </div>
          </div>
          <div className="mt-2 bg-white rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedToday / todaysRituals.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Rituals List */}
      <div className="flex-1 overflow-y-auto">
        {rituals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rituals yet</h3>
            <p className="text-gray-600 mb-4">Start building positive habits by creating your first ritual</p>
            <button
              onClick={onCreateRitual}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Ritual
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rituals.map((ritual) => {
              const isScheduledToday = ritual.frequency.includes(new Date().getDay());
              const isCompletedToday = ritual.lastCompleted === getCurrentDate();
              const canComplete = isScheduledToday && !isCompletedToday;

              return (
                <div
                  key={ritual.id}
                  className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg ${
                    isCompletedToday
                      ? 'border-green-200 bg-green-50'
                      : isScheduledToday
                      ? 'border-purple-200 hover:border-purple-300'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ritual.name}</h3>
                        {ritual.streak > 0 && (
                          <div className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                            <Flame className="w-3 h-3" />
                            <span>{ritual.streak}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTrigger(ritual.trigger)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatFrequency(ritual.frequency)}</span>
                        </div>
                        {ritual.reward && (
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4" />
                            <span>{ritual.reward}</span>
                          </div>
                        )}
                      </div>

                      {ritual.streak >= 50 && ritual.streak < 60 && (
                        <div className="mt-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {60 - ritual.streak} more days to become a habit!
                        </div>
                      )}
                    </div>

                    {canComplete && (
                      <button
                        onClick={() => onCompleteRitual(ritual.id)}
                        className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
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

export default Rituals;