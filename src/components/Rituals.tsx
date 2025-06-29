import React, { useState, useRef, useEffect } from 'react';
import { Plus, Clock, Zap, Flame, Gift, Calendar, Edit, Trash2, MoreVertical, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Ritual } from '../types';
import { getTodaysScheduledRituals, getOtherRituals } from '../utils/streaks';
import { getCurrentDate } from '../utils/storage';

interface RitualsProps {
  rituals: Ritual[];
  onCreateRitual: () => void;
  onCompleteRitual: (ritualId: string) => void;
  onEditRitual: (ritual: Ritual) => void;
  onDeleteRitual: (ritualId: string) => void;
}

const Rituals: React.FC<RitualsProps> = ({ 
  rituals, 
  onCreateRitual, 
  onCompleteRitual,
  onEditRitual,
  onDeleteRitual
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showOtherRituals, setShowOtherRituals] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const todaysRituals = getTodaysScheduledRituals(rituals);
  const otherRituals = getOtherRituals(rituals);
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

  const handleMenuClick = (ritualId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (openMenuId === ritualId) {
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
    
    setOpenMenuId(ritualId);
  };

  const handleEdit = (ritual: Ritual, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditRitual(ritual);
    setOpenMenuId(null);
  };

  const handleDelete = (ritualId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this ritual?')) {
      onDeleteRitual(ritualId);
    }
    setOpenMenuId(null);
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

  const RitualCard: React.FC<{ ritual: Ritual; isScheduledToday: boolean }> = ({ ritual, isScheduledToday }) => {
    const isCompletedToday = ritual.lastCompleted === getCurrentDate();
    const canComplete = !isCompletedToday; // Allow completion even if not scheduled today

    return (
      <div
        className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg relative ${
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
              {ritual.frozenStreaks > 0 && (
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  <Shield className="w-3 h-3" />
                  <span>{ritual.frozenStreaks}</span>
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
                {20 - ritual.streak} more days to become a habit!
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {canComplete && (
              <button
                onClick={() => onCompleteRitual(ritual.id)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Complete
              </button>
            )}

            {isCompletedToday && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                Completed ✓
              </div>
            )}

            {!isScheduledToday && !isCompletedToday && (
              <div className="text-gray-400 text-sm">
                Not scheduled
              </div>
            )}

            {/* Menu Button */}
            <div className="relative" ref={el => menuRefs.current[ritual.id] = el}>
              <button
                onClick={(e) => handleMenuClick(ritual.id, e)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === ritual.id && (
                <div className={`absolute right-0 ${
                  menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
                } bg-white rounded-lg shadow-xl border py-1 z-20 min-w-[120px]`}>
                  <button
                    onClick={(e) => handleEdit(ritual, e)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(ritual.id, e)}
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
          <div className="space-y-6">
            {/* Today's Rituals */}
            {todaysRituals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Rituals</h2>
                <div className="space-y-4">
                  {todaysRituals.map((ritual) => (
                    <RitualCard
                      key={ritual.id}
                      ritual={ritual}
                      isScheduledToday={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Rituals */}
            {otherRituals.length > 0 && (
              <div>
                <button
                  onClick={() => setShowOtherRituals(!showOtherRituals)}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4 hover:text-purple-600 transition-colors"
                >
                  <span>Other Rituals</span>
                  {showOtherRituals ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {showOtherRituals && (
                  <div className="space-y-4">
                    {otherRituals.map((ritual) => (
                      <RitualCard
                        key={ritual.id}
                        ritual={ritual}
                        isScheduledToday={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state for today's rituals only */}
            {todaysRituals.length === 0 && otherRituals.length > 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No rituals scheduled for today</h3>
                <p className="text-gray-600">Check "Other Rituals" below or create a new ritual</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rituals;