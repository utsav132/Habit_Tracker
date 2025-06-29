import React from 'react';
import { X, AlertTriangle, Zap, Crown } from 'lucide-react';
import { HabitItem } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName: string;
  affectedItems: HabitItem[];
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  habitName,
  affectedItems
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{habitName}</strong>?
          </p>

          {affectedItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium mb-2">
                    Warning: This will affect other habits/rituals
                  </p>
                  <p className="text-amber-700 text-sm mb-3">
                    The following items are triggered by this habit and will be moved to "Not Set" section:
                  </p>
                  <ul className="space-y-2">
                    {affectedItems.map((item) => (
                      <li key={item.id} className="flex items-center space-x-2 text-sm text-amber-700">
                        {item.type === 'habit' ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-amber-700 text-sm mt-3">
                    You'll need to set new triggers for these items manually.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;