import React, { useState } from 'react';
import { Search, Clock, Zap } from 'lucide-react';
import { HabitItem } from '../types';

interface HabitPickerProps {
  habits: HabitItem[];
  onSelect: (habit: HabitItem) => void;
  selectedHabitId?: string;
  usedTriggerHabitIds?: string[]; // IDs of habits already used as triggers
}

const HabitPicker: React.FC<HabitPickerProps> = ({ 
  habits, 
  onSelect, 
  selectedHabitId,
  usedTriggerHabitIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHabits = habits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search habits..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2">
        {filteredHabits.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {habits.length === 0 ? 'No habits available yet' : 'No habits found'}
          </p>
        ) : (
          filteredHabits.map((habit) => {
            const isUsedAsTrigger = usedTriggerHabitIds.includes(habit.id);
            const isSelected = selectedHabitId === habit.id;
            
            return (
              <button
                key={habit.id}
                onClick={() => !isUsedAsTrigger && onSelect(habit)}
                disabled={isUsedAsTrigger}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  isUsedAsTrigger
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : isSelected
                    ? 'border-purple-500 bg-purple-50 hover:shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {habit.type === 'habit' ? (
                    <Zap className={`w-5 h-5 ${isUsedAsTrigger ? 'text-gray-400' : 'text-purple-500'}`} />
                  ) : (
                    <Clock className={`w-5 h-5 ${isUsedAsTrigger ? 'text-gray-400' : 'text-blue-500'}`} />
                  )}
                  <div>
                    <div className={`font-medium ${isUsedAsTrigger ? 'text-gray-500' : 'text-gray-900'}`}>
                      {habit.name}
                    </div>
                    <div className={`text-sm ${isUsedAsTrigger ? 'text-gray-400' : 'text-gray-500'}`}>
                      {habit.type === 'habit' ? 'Habit' : 'Ritual'} • {habit.streak} day streak
                      {isUsedAsTrigger && ' • Already used as trigger'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitPicker;