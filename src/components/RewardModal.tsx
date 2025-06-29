import React from 'react';
import { CheckCircle, Gift, Trophy, Crown, Zap } from 'lucide-react';

interface RewardModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  reward?: string;
  type: 'ritual' | 'habit' | 'task' | 'achievement' | 'promotion';
}

const RewardModal: React.FC<RewardModalProps> = ({ 
  show, 
  onClose, 
  title, 
  message, 
  reward,
  type 
}) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'ritual':
        return <Zap className="w-8 h-8 text-purple-500" />;
      case 'habit':
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 'task':
        return <CheckCircle className="w-8 h-8 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'promotion':
        return <Crown className="w-8 h-8 text-green-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'ritual':
        return 'from-purple-50 to-pink-50 border-purple-200';
      case 'habit':
        return 'from-yellow-50 to-orange-50 border-yellow-200';
      case 'task':
        return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'achievement':
        return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'promotion':
        return 'from-green-50 to-emerald-50 border-green-200';
      default:
        return 'from-green-50 to-emerald-50 border-green-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className={`bg-gradient-to-br ${getGradient()} rounded-2xl shadow-2xl border-2 max-w-md w-full mx-4 transform transition-all duration-300 scale-100`}
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {message}
          </p>

          {/* Reward */}
          {reward && (
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-gray-800">
                <Gift className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Reward:</span>
              </div>
              <p className="text-gray-700 mt-1 font-semibold">
                {reward}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${
              type === 'ritual' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
              type === 'habit' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' :
              type === 'task' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
              type === 'achievement' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600' :
              'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default RewardModal;