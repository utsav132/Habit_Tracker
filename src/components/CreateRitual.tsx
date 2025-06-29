import React, { useState } from 'react';
import { X, Calendar, Gift, Clock, Zap, AlertCircle } from 'lucide-react';
import { Ritual, HabitItem, TimeTrigger, HabitTrigger } from '../types';
import { generateUniqueName, checkForDuplicateName } from '../utils/nameUtils';
import TimePicker from './TimePicker';
import HabitPicker from './HabitPicker';

interface CreateRitualProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ritual: Omit<Ritual, 'id' | 'createdAt'>) => void;
  existingHabits: HabitItem[];
  existingRituals: Ritual[];
}

const CreateRitual: React.FC<CreateRitualProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingHabits,
  existingRituals
}) => {
  const [name, setName] = useState('');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [suggestedName, setSuggestedName] = useState('');
  const [triggerType, setTriggerType] = useState<'time' | 'habit'>('time');
  const [time, setTime] = useState('09:00');
  const [selectedHabit, setSelectedHabit] = useState<HabitItem | null>(null);
  const [frequency, setFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reward, setReward] = useState('');

  const weekDays = [
    { id: 0, name: 'Sun', full: 'Sunday' },
    { id: 1, name: 'Mon', full: 'Monday' },
    { id: 2, name: 'Tue', full: 'Tuesday' },
    { id: 3, name: 'Wed', full: 'Wednesday' },
    { id: 4, name: 'Thu', full: 'Thursday' },
    { id: 5, name: 'Fri', full: 'Friday' },
    { id: 6, name: 'Sat', full: 'Saturday' },
  ];

  const allExistingItems = [...existingHabits, ...existingRituals];

  // Get habit IDs that are already used as triggers
  const usedTriggerHabitIds = existingRituals
    .filter(ritual => ritual.trigger.type === 'habit')
    .map(ritual => (ritual.trigger as HabitTrigger).habitId);

  const acceptSuggestedName = () => {
    setName(suggestedName);
    setShowDuplicateWarning(false);
    setSuggestedName('');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    // Check for duplicates on save
    if (checkForDuplicateName(name, allExistingItems)) {
      const suggested = generateUniqueName(name, allExistingItems);
      setSuggestedName(suggested);
      setShowDuplicateWarning(true);
      return;
    }

    let trigger: TimeTrigger | HabitTrigger;
    
    if (triggerType === 'time') {
      trigger = { type: 'time', time };
    } else {
      if (!selectedHabit) return;
      trigger = { 
        type: 'habit', 
        habitId: selectedHabit.id, 
        habitName: selectedHabit.name 
      };
    }

    const ritual: Omit<Ritual, 'id' | 'createdAt'> = {
      type: 'ritual',
      name: name.trim(),
      trigger,
      frequency,
      reward: reward.trim() || undefined,
      streak: 0,
      skipUsed: false,
      completedDates: [],
    };

    onSave(ritual);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setShowDuplicateWarning(false);
    setSuggestedName('');
    setTriggerType('time');
    setTime('09:00');
    setSelectedHabit(null);
    setFrequency([0, 1, 2, 3, 4, 5, 6]);
    setReward('');
  };

  const toggleFrequency = (dayId: number) => {
    setFrequency(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Create New Ritual</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ritual Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            
            {/* Duplicate Name Warning */}
            {showDuplicateWarning && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 mb-2">
                      A ritual or habit with this name already exists.
                    </p>
                    <p className="text-sm text-amber-700 mb-3">
                      Suggested name: <strong>{suggestedName}</strong>
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={acceptSuggestedName}
                        className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
                      >
                        Use Suggested Name
                      </button>
                      <button
                        onClick={() => setShowDuplicateWarning(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                      >
                        Keep Editing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger *
            </label>
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setTriggerType('time')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border transition-colors ${
                  triggerType === 'time'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Time</span>
              </button>
              <button
                onClick={() => setTriggerType('habit')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border transition-colors ${
                  triggerType === 'habit'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>After Habit</span>
              </button>
            </div>

            {triggerType === 'time' ? (
              <TimePicker value={time} onChange={setTime} />
            ) : (
              <HabitPicker
                habits={existingHabits}
                onSelect={setSelectedHabit}
                selectedHabitId={selectedHabit?.id}
                usedTriggerHabitIds={usedTriggerHabitIds}
              />
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Frequency
            </label>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleFrequency(day.id)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    frequency.includes(day.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Gift className="w-4 h-4 inline mr-1" />
              Reward (Optional)
            </label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g., Watch favorite TV show"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || (triggerType === 'habit' && !selectedHabit)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Ritual
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRitual;