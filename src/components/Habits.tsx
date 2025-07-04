import React, { useState, useRef, useEffect } from 'react';
import { Crown, Flame, Gift, Calendar, Clock, Edit, Trash2, MoreVertical, Shield, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Habit, HabitItem } from '../types';
import { getTodaysScheduledItems } from '../utils/streaks';
import { getCurrentDate } from '../utils/storage';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface HabitsProps {
  habits: Habit[];
  onCompleteHabit: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  allHabits: HabitItem[];
  allRituals: any[];
}

const Habits: React.FC<HabitsProps> = ({ 
  habits, 
  onCompleteHabit, 
  onEditHabit, 
  onDeleteHabit,
  allHabits,
  allRituals
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  const [showNotSetHabits, setShowNotSetHabits] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [affectedItems, setAffectedItems] = useState<HabitItem[]>([]);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const todaysHabits = getTodaysScheduledItems(habits);
  const completedToday = todaysHabits.filter(habit => 
    habit.lastCompleted === getCurrentDate()
  ).length;

  // Separate habits with and without triggers
  const habitsWithTriggers = habits.filter(habit => habit.trigger);
  const habitsWithoutTriggers = habits.filter(habit => !habit.trigger);

  const formatTrigger = (trigger: Habit['trigger']) => {
    if (!trigger) return 'No trigger set';
    
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

  const handleMenuClick = (habitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (openMenuId === habitId) {
      setOpenMenuId(null);
      return;
    }

    // Calculate position
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // If there's not enough space below (need ~80px for menu) but enough above
    if (spaceBelow < 80 && spaceAbove > 80) {
      setMenuPosition('top');
    } else {
      setMenuPosition('bottom');
    }
    
    setOpenMenuId(habitId);
  };

  const handleEdit = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditHabit(habit);
    setOpenMenuId(null);
  };

  const handleDelete = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Find all items that are triggered by this habit
    const affected = [
      ...allRituals.filter(r => r.trigger.type === 'habit' && r.trigger.habitId === habit.id),
      ...allHabits.filter(h => h.trigger?.type === 'habit' && h.trigger.habitId === habit.id)
    ];

    if (affected.length > 0) {
      setHabitToDelete(habit);
      setAffectedItems(affected);
      setDeleteModalOpen(true);
    } else {
      onDeleteHabit(habit.id);
    }
    
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (habitToDelete) {
      onDeleteHabit(habitToDelete.id);
      setDeleteModalOpen(false);
      setHabitToDelete(null);
      setAffectedItems([]);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setHabitToDelete(null);
    setAffectedItems([]);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        const menuElement = menuRefs.current[openMenuId];
        const target = event.target as Node;
        if (menuElement && !menuElement.contains(target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const HabitCard: React.FC<{ habit: Habit; showTriggerWarning?: boolean }> = ({ habit, showTriggerWarning = false }) => {
    const isScheduledToday = habit.frequency.includes(new Date().getDay());
    const isCompletedToday = habit.lastCompleted === getCurrentDate();
    const canComplete = isScheduledToday && !isCompletedToday && habit.trigger; // Can only complete if has trigger
    const daysSinceHabit = getDaysSinceHabit(habit.becameHabitAt);

    return (
      <div
        className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg relative ${
          isCompletedToday
            ? 'border-green-200 bg-green-50'
            : isScheduledToday && habit.trigger
            ? 'border-yellow-200 hover:border-yellow-300'
            : !habit.trigger
            ? 'border-orange-200 bg-orange-50'
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
              {habit.frozenStreaks > 0 && (
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  <span>{habit.frozenStreaks}</span>
                </div>
              )}
            </div>

            {showTriggerWarning && !habit.trigger && (
              <div className="mb-2 p-2 bg-orange-100 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">No trigger set - please edit to add a trigger</span>
                </div>
              </div>
            )}

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

            {daysSinceHabit >= 90 && (
              <div className="mt-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded inline-block ml-2">
                3+ month streak! 🎉
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {canComplete && (
              <button
                onClick={() => onCompleteHabit(habit.id)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Complete
              </button>
            )}

            {isCompletedToday && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                Completed ✓
              </div>
            )}

            {!isScheduledToday && habit.trigger && (
              <div className="text-gray-400 text-sm">
                Not scheduled
              </div>
            )}

            {!habit.trigger && (
              <div className="text-orange-600 text-sm font-medium">
                No trigger
              </div>
            )}

            {/* Menu Button */}
            <div className="relative" ref={el => menuRefs.current[habit.id] = el}>
              <button
                onClick={(e) => handleMenuClick(habit.id, e)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === habit.id && (
                <div className={`absolute right-0 ${
                  menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                } bg-white rounded-lg shadow-xl border py-1 z-20 min-w-[120px]`}>
                  <button
                    onClick={(e) => handleEdit(habit, e)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(habit, e)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
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
          <div className="space-y-6">
            {/* Habits with triggers */}
            {habitsWithTriggers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Habits</h2>
                <div className="space-y-4">
                  {habitsWithTriggers.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              </div>
            )}

            {/* Habits without triggers */}
            {habitsWithoutTriggers.length > 0 && (
              <div>
                <button
                  onClick={() => setShowNotSetHabits(!showNotSetHabits)}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4 hover:text-orange-600 transition-colors"
                >
                  <span>Not Set ({habitsWithoutTriggers.length})</span>
                  {showNotSetHabits ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {showNotSetHabits && (
                  <div className="space-y-4">
                    {habitsWithoutTriggers.map((habit) => (
                      <HabitCard key={habit.id} habit={habit} showTriggerWarning={true} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        habitName={habitToDelete?.name || ''}
        affectedItems={affectedItems}
      />
    </div>
  );
};

export default Habits;