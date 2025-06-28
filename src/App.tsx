import React, { useState, useEffect } from 'react';
import { Calendar, Zap, Crown, Trophy, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { AppData, Ritual, Habit, Task, HabitItem } from './types';
import { getStoredData, saveData } from './utils/storage';
import { DateManager } from './utils/dateUtils';
import { calculateStreak, calculateFrozenStreaks, shouldPromoteToHabit, shouldDemoteToRitual } from './utils/streaks';
import { checkAchievements } from './utils/achievements';
import { NotificationManager } from './utils/notifications';
import Rituals from './components/Rituals';
import Tasks from './components/Tasks';
import Habits from './components/Habits';
import Achievements from './components/Achievements';
import CreateRitual from './components/CreateRitual';
import CreateTask from './components/CreateTask';
import EditRitual from './components/EditRitual';
import EditTask from './components/EditTask';
import EditHabit from './components/EditHabit';
import ConfettiAnimation from './components/ConfettiAnimation';

type TabType = 'rituals' | 'tasks' | 'habits' | 'achievements';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('rituals');
  const [data, setData] = useState<AppData>(getStoredData());
  const [isCreateRitualOpen, setIsCreateRitualOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditRitualOpen, setIsEditRitualOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string>('');
  const [devMode, setDevMode] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  const notificationManager = NotificationManager.getInstance();
  const dateManager = DateManager.getInstance();

  // Update current date when dev mode changes
  useEffect(() => {
    setCurrentDate(dateManager.getFormattedCurrentDate());
  }, [devMode]);

  // Initialize notifications on app load
  useEffect(() => {
    const initNotifications = async () => {
      const hasPermission = await notificationManager.requestPermission();
      if (hasPermission) {
        notificationManager.rescheduleAllRituals(data.rituals);
      }
    };
    initNotifications();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData(data);
    // Reschedule notifications when rituals change
    notificationManager.rescheduleAllRituals(data.rituals);
  }, [data]);

  // Check and update achievements
  useEffect(() => {
    const updatedAchievements = checkAchievements(data);
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(data.achievements)) {
      setData(prev => ({ ...prev, achievements: updatedAchievements }));
      
      // Show confetti for new achievements
      const newlyUnlocked = updatedAchievements.filter(
        (achievement, index) => 
          achievement.unlocked && !data.achievements[index]?.unlocked
      );
      
      if (newlyUnlocked.length > 0) {
        setShowConfetti(true);
        setRewardMessage(`🎉 Achievement Unlocked: ${newlyUnlocked[0].name}!`);
        notificationManager.sendAchievementNotification(newlyUnlocked[0].name);
      }
    }
  }, [data.rituals, data.habits, data.tasks]);

  // Update streaks when date changes in dev mode
  useEffect(() => {
    if (devMode) {
      setData(prev => ({
        ...prev,
        rituals: prev.rituals.map(ritual => ({
          ...ritual,
          streak: calculateStreak(ritual),
          frozenStreaks: calculateFrozenStreaks(ritual),
        })),
        habits: prev.habits.map(habit => ({
          ...habit,
          streak: calculateStreak(habit),
          frozenStreaks: calculateFrozenStreaks(habit),
        })),
      }));
    }
  }, [currentDate, devMode]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleDevMode = () => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    dateManager.setDevMode(newDevMode);
    setCurrentDate(dateManager.getFormattedCurrentDate());
  };

  const goToNextDay = () => {
    if (devMode) {
      dateManager.goToNextDay();
      setCurrentDate(dateManager.getFormattedCurrentDate());
    }
  };

  const goToPreviousDay = () => {
    if (devMode) {
      dateManager.goToPreviousDay();
      setCurrentDate(dateManager.getFormattedCurrentDate());
    }
  };

  const handleCreateRitual = (ritualData: Omit<Ritual, 'id' | 'createdAt'>) => {
    const newRitual: Ritual = {
      ...ritualData,
      id: generateId(),
      createdAt: dateManager.getCurrentDate(),
      frozenStreaks: 0,
    };

    setData(prev => ({
      ...prev,
      rituals: [...prev.rituals, newRitual],
    }));

    // Schedule notification for the new ritual
    notificationManager.scheduleRitualNotification(newRitual);
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: dateManager.getCurrentDate(),
    };

    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const handleEditRitual = (ritual: Ritual) => {
    setEditingRitual(ritual);
    setIsEditRitualOpen(true);
  };

  const handleSaveEditedRitual = (updatedRitual: Ritual) => {
    setData(prev => ({
      ...prev,
      rituals: prev.rituals.map(r => r.id === updatedRitual.id ? updatedRitual : r),
    }));
    setIsEditRitualOpen(false);
    setEditingRitual(null);
  };

  const handleDeleteRitual = (ritualId: string) => {
    notificationManager.clearNotification(ritualId);
    setData(prev => ({
      ...prev,
      rituals: prev.rituals.filter(r => r.id !== ritualId),
    }));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskOpen(true);
  };

  const handleSaveEditedTask = (updatedTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
    }));
    setIsEditTaskOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
    }));
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditHabitOpen(true);
  };

  const handleSaveEditedHabit = (updatedHabit: Habit) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === updatedHabit.id ? updatedHabit : h),
    }));
    setIsEditHabitOpen(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    notificationManager.clearNotification(habitId);
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId),
    }));
  };

  const handleCompleteRitual = (ritualId: string) => {
    setData(prev => {
      const ritual = prev.rituals.find(r => r.id === ritualId);
      if (!ritual) return prev;

      const today = dateManager.getCurrentDate();
      const updatedCompletedDates = [...(ritual.completedDates || []), today];
      const newStreak = calculateStreak({
        ...ritual,
        completedDates: updatedCompletedDates,
      });
      const newFrozenStreaks = calculateFrozenStreaks({
        ...ritual,
        completedDates: updatedCompletedDates,
      });

      const updatedRitual: Ritual = {
        ...ritual,
        lastCompleted: today,
        completedDates: updatedCompletedDates,
        streak: newStreak,
        frozenStreaks: newFrozenStreaks,
      };

      let updatedRituals = prev.rituals.map(r => r.id === ritualId ? updatedRitual : r);
      let updatedHabits = [...prev.habits];

      // Check if ritual should become a habit
      if (shouldPromoteToHabit(updatedRitual)) {
        const newHabit: Habit = {
          ...updatedRitual,
          type: 'habit',
          becameHabitAt: today,
        };
        
        updatedHabits = [...updatedHabits, newHabit];
        updatedRituals = updatedRituals.filter(r => r.id !== ritualId);
        
        setRewardMessage(`🎉 ${ritual.name} is now a habit! You've maintained it for 60+ days!`);
        setShowConfetti(true);
        notificationManager.sendRewardNotification(
          'New Habit Formed!',
          `${ritual.name} is now a habit! You've maintained it for 60+ days!`
        );
      } else {
        // Show reward message if ritual has a reward
        if (ritual.reward) {
          setRewardMessage(`🎁 ${ritual.reward}`);
          setShowConfetti(true);
          notificationManager.sendRewardNotification('Reward Earned!', ritual.reward);
        } else {
          setRewardMessage(`✅ Great job completing ${ritual.name}!`);
          setShowConfetti(true);
        }
      }

      // Send notifications for habit-triggered rituals
      const triggeredRituals = prev.rituals.filter(r => 
        r.trigger.type === 'habit' && r.trigger.habitId === ritualId
      );
      if (triggeredRituals.length > 0) {
        notificationManager.sendHabitTriggerNotification(ritual.name, triggeredRituals);
      }

      return {
        ...prev,
        rituals: updatedRituals,
        habits: updatedHabits,
      };
    });
  };

  const handleCompleteHabit = (habitId: string) => {
    setData(prev => {
      const habit = prev.habits.find(h => h.id === habitId);
      if (!habit) return prev;

      const today = dateManager.getCurrentDate();
      const updatedCompletedDates = [...(habit.completedDates || []), today];
      const newStreak = calculateStreak({
        ...habit,
        completedDates: updatedCompletedDates,
      });
      const newFrozenStreaks = calculateFrozenStreaks({
        ...habit,
        completedDates: updatedCompletedDates,
      });

      const updatedHabit: Habit = {
        ...habit,
        lastCompleted: today,
        completedDates: updatedCompletedDates,
        streak: newStreak,
        frozenStreaks: newFrozenStreaks,
      };

      let updatedHabits = prev.habits.map(h => h.id === habitId ? updatedHabit : h);
      let updatedRituals = [...prev.rituals];

      // Check if habit should become a ritual
      if (shouldDemoteToRitual(updatedHabit)) {
        const newRitual: Ritual = {
          ...updatedHabit,
          type: 'ritual',
        };
        
        updatedRituals = [...updatedRituals, newRitual];
        updatedHabits = updatedHabits.filter(h => h.id !== habitId);
      } else {
        // Show reward message
        if (habit.reward) {
          setRewardMessage(`🎁 ${habit.reward}`);
          notificationManager.sendRewardNotification('Reward Earned!', habit.reward);
        } else {
          setRewardMessage(`✅ Excellent! You maintained ${habit.name}!`);
        }
        setShowConfetti(true);
      }

      // Send notifications for habit-triggered rituals
      const triggeredRituals = prev.rituals.filter(r => 
        r.trigger.type === 'habit' && r.trigger.habitId === habitId
      );
      if (triggeredRituals.length > 0) {
        notificationManager.sendHabitTriggerNotification(habit.name, triggeredRituals);
      }

      return {
        ...prev,
        rituals: updatedRituals,
        habits: updatedHabits,
      };
    });
  };

  const handleCompleteTask = (taskId: string) => {
    setData(prev => {
      const updatedTasks = prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );

      const task = prev.tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        setRewardMessage(`✅ Task completed: ${task.name}!`);
        setShowConfetti(true);
      }

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    setRewardMessage('');
  };

  const tabs = [
    { id: 'rituals' as TabType, name: 'Rituals', icon: Zap, count: data.rituals.length },
    { id: 'tasks' as TabType, name: 'Tasks', icon: Calendar, count: data.tasks.filter(t => !t.completed).length },
    { id: 'habits' as TabType, name: 'Habits', icon: Crown, count: data.habits.length },
    { id: 'achievements' as TabType, name: 'Achievements', icon: Trophy, count: data.achievements.filter(a => a.unlocked).length },
  ];

  const allHabits: HabitItem[] = [...data.rituals, ...data.habits];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Reward Message */}
      {rewardMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-40 animate-bounce">
          {rewardMessage}
        </div>
      )}

      {/* Confetti Animation */}
      <ConfettiAnimation show={showConfetti} onComplete={handleConfettiComplete} />

      {/* Main App */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
              
              {/* Dev Mode Date Controls */}
              {devMode && (
                <div className="flex items-center space-x-2 bg-orange-100 px-3 py-2 rounded-lg">
                  <button
                    onClick={goToPreviousDay}
                    className="p-1 hover:bg-orange-200 rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-orange-700" />
                  </button>
                  <span className="text-sm font-medium text-orange-800 min-w-[100px] text-center">
                    {currentDate}
                  </span>
                  <button
                    onClick={goToNextDay}
                    className="p-1 hover:bg-orange-200 rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-orange-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                      {tab.count > 0 && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === tab.id
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Dev Mode Toggle */}
              <button
                onClick={toggleDevMode}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  devMode
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Dev Mode</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
            {activeTab === 'rituals' && (
              <Rituals
                rituals={data.rituals}
                onCreateRitual={() => setIsCreateRitualOpen(true)}
                onCompleteRitual={handleCompleteRitual}
                onEditRitual={handleEditRitual}
                onDeleteRitual={handleDeleteRitual}
              />
            )}
            {activeTab === 'tasks' && (
              <Tasks
                tasks={data.tasks}
                onCreateTask={() => setIsCreateTaskOpen(true)}
                onCompleteTask={handleCompleteTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            )}
            {activeTab === 'habits' && (
              <Habits
                habits={data.habits}
                onCompleteHabit={handleCompleteHabit}
                onEditHabit={handleEditHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            )}
            {activeTab === 'achievements' && (
              <Achievements achievements={data.achievements} />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreateRitual
        isOpen={isCreateRitualOpen}
        onClose={() => setIsCreateRitualOpen(false)}
        onSave={handleCreateRitual}
        existingHabits={allHabits}
        existingRituals={data.rituals}
      />

      <CreateTask
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSave={handleCreateTask}
        existingTasks={data.tasks}
      />

      <EditRitual
        isOpen={isEditRitualOpen}
        onClose={() => setIsEditRitualOpen(false)}
        onSave={handleSaveEditedRitual}
        ritual={editingRitual}
        existingHabits={allHabits}
        existingRituals={data.rituals}
      />

      <EditTask
        isOpen={isEditTaskOpen}
        onClose={() => setIsEditTaskOpen(false)}
        onSave={handleSaveEditedTask}
        task={editingTask}
        existingTasks={data.tasks}
      />

      <EditHabit
        isOpen={isEditHabitOpen}
        onClose={() => setIsEditHabitOpen(false)}
        onSave={handleSaveEditedHabit}
        habit={editingHabit}
        existingHabits={allHabits}
        existingRituals={data.rituals}
      />
    </div>
  );
}

export default App;