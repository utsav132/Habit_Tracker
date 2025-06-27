import React from 'react';
import { Trophy, Star, CheckCircle, Calendar, Target, Crown, Flame, Zap, Lock } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Zap': <Zap className="w-6 h-6" />,
      'Trophy': <Trophy className="w-6 h-6" />,
      'Calendar': <Calendar className="w-6 h-6" />,
      'Star': <Star className="w-6 h-6" />,
      'CheckCircle': <CheckCircle className="w-6 h-6" />,
      'Target': <Target className="w-6 h-6" />,
      'Crown': <Crown className="w-6 h-6" />,
      'Flame': <Flame className="w-6 h-6" />,
    };
    return iconMap[iconName] || <Trophy className="w-6 h-6" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const AchievementCard: React.FC<{ achievement: Achievement; unlocked: boolean }> = ({ 
    achievement, 
    unlocked 
  }) => (
    <div
      className={`bg-white rounded-xl p-4 border-2 transition-all hover:shadow-lg ${
        unlocked
          ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            unlocked
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {unlocked ? getIcon(achievement.icon) : <Lock className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold ${
              unlocked ? 'text-gray-900' : 'text-gray-500'
            }`}
          >
            {achievement.name}
          </h3>
          <p
            className={`text-sm ${
              unlocked ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            {achievement.description}
          </p>
          {unlocked && achievement.unlockedAt && (
            <p className="text-xs text-yellow-600 mt-1">
              Unlocked {formatDate(achievement.unlockedAt)}
            </p>
          )}
          {!unlocked && achievement.maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.maxProgress}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                  }}
                />
              </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">Your journey milestones and accomplishments</p>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
          <Trophy className="w-4 h-4" />
          <span>{unlockedAchievements.length}/{achievements.length}</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-yellow-900">Overall Progress</h3>
          <div className="text-lg font-bold text-yellow-600">
            {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
          </div>
        </div>
        <div className="bg-white rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Unlocked ({unlockedAchievements.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-gray-400" />
              Locked ({lockedAchievements.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {lockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {achievements.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
            <p className="text-gray-600">Start completing rituals and tasks to unlock achievements</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;