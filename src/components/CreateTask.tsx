import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Task } from '../types';
import { getCurrentDate, getTomorrowDate, formatDate } from '../utils/storage';

interface CreateTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(getCurrentDate());

  const handleSave = () => {
    if (!name.trim()) return;

    const task: Omit<Task, 'id' | 'createdAt'> = {
      name: name.trim(),
      date,
      completed: false,
    };

    onSave(task);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Buy groceries"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDate(getCurrentDate())}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  date === getCurrentDate()
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Today</div>
                <div className="text-sm text-gray-500">
                  {formatDate(getCurrentDate())}
                </div>
              </button>
              <button
                onClick={() => setDate(getTomorrowDate())}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  date === getTomorrowDate()
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Tomorrow</div>
                <div className="text-sm text-gray-500">
                  {formatDate(getTomorrowDate())}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;