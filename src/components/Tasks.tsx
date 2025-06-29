import React, { useState, useRef, useEffect } from 'react';
import { Plus, CheckCircle, Circle, Calendar, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Task } from '../types';
import { getCurrentDate, formatDate } from '../utils/storage';

interface TasksProps {
  tasks: Task[];
  onCreateTask: () => void;
  onCompleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const Tasks: React.FC<TasksProps> = ({ 
  tasks, 
  onCreateTask, 
  onCompleteTask,
  onEditTask,
  onDeleteTask
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const todaysTasks = tasks.filter(task => task.date === getCurrentDate());
  const tomorrowsTasks = tasks.filter(task => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return task.date === tomorrow.toISOString().split('T')[0];
  });

  const completedToday = todaysTasks.filter(task => task.completed).length;

  const handleMenuClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (openMenuId === taskId) {
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
    
    setOpenMenuId(taskId);
  };

  const handleEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask(task);
    setOpenMenuId(null);
  };

  const handleDelete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      onDeleteTask(taskId);
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

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => (
    <div
      className={`bg-white rounded-lg p-4 border transition-all hover:shadow-md relative ${
        task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onCompleteTask(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {task.completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
        </button>
        <div className="flex-1">
          <span
            className={`${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {task.name}
          </span>
        </div>
        
        {/* Menu Button */}
        <div className="relative" ref={el => menuRefs.current[task.id] = el}>
          <button
            onClick={(e) => handleMenuClick(task.id, e)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {openMenuId === task.id && (
            <div className={`absolute right-0 ${
              menuPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            } bg-white rounded-lg shadow-xl border py-1 z-20 min-w-[120px]`}>
              <button
                onClick={(e) => handleEdit(task, e)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => handleDelete(task.id, e)}
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
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Your daily tasks and to-dos</p>
        </div>
        <button
          onClick={onCreateTask}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
      </div>

      {/* Today's Progress */}
      {todaysTasks.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Today's Progress</h3>
              <p className="text-blue-700">
                {completedToday} of {todaysTasks.length} tasks completed
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {todaysTasks.length > 0 ? Math.round((completedToday / todaysTasks.length) * 100) : 0}%
            </div>
          </div>
          <div className="mt-2 bg-white rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: todaysTasks.length > 0 
                  ? `${(completedToday / todaysTasks.length) * 100}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Today's Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Today - {formatDate(getCurrentDate())}
          </h2>
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-gray-600 mb-3">No tasks for today</p>
              <button
                onClick={onCreateTask}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Tomorrow's Tasks */}
        {tomorrowsTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Tomorrow - {formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            </h2>
            <div className="space-y-3">
              {tomorrowsTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todaysTasks.length === 0 && tomorrowsTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">Create tasks to stay organized and productive</p>
            <button
              onClick={onCreateTask}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;