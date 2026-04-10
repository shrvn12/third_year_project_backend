const User = require('../models/User');
const XpEvent = require('../models/XpEvent');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// XP thresholds per level (index = level)
const LEVEL_THRESHOLDS = [0, 0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];

const getLevelForXp = (totalXp) => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 1; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) { level = i; break; }
  }
  return level;
};

/**
 * Award XP to a user. Returns { newTotal, leveledUp, newLevel, badgesUnlocked }
 * This is internal — called from lesson/quiz/game/puzzle/streak handlers only.
 */
const awardXp = async (userId, amount, source, sourceId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oldLevel = user.level;
  user.xp += amount;
  const newLevel = getLevelForXp(user.xp);
  const leveledUp = newLevel > oldLevel;
  user.level = newLevel;
  await user.save();

  // Log the XP event
  await XpEvent.create({ user: userId, amount, source, sourceId });

  // Check badges triggered by XP / level milestones
  const badgesUnlocked = await checkAndUnlockBadges(userId, source, user);

  return { newTotal: user.xp, leveledUp, newLevel: leveledUp ? newLevel : undefined, badgesUnlocked };
};

/**
 * Check badge conditions server-side. Extend trigger cases as needed.
 */
const checkAndUnlockBadges = async (userId, trigger, user) => {
  const candidates = await Badge.find({ trigger });
  const earned = await UserBadge.find({ user: userId }).select('badge');
  const earnedIds = new Set(earned.map(b => b.badge.toString()));

  const unlocked = [];

  for (const badge of candidates) {
    if (earnedIds.has(badge._id.toString())) continue;

    let conditionMet = false;

    switch (badge.trigger) {
      case 'lesson_complete':
        conditionMet = (user.lessonsCompleted || 0) >= badge.threshold;
        break;
      case 'streak_7':
        conditionMet = user.currentStreak >= 7;
        break;
      case 'streak_30':
        conditionMet = user.currentStreak >= 30;
        break;
      case 'level_up':
        conditionMet = user.level >= badge.threshold;
        break;
      case 'quiz_perfect':
        // caller sets this context — handled in quiz controller
        conditionMet = trigger === 'quiz_perfect';
        break;
      default:
        break;
    }

    if (conditionMet) {
      await UserBadge.create({ user: userId, badge: badge._id });
      unlocked.push({ id: badge._id, icon: badge.icon, name: badge.name, xp: badge.xp });
    }
  }

  return unlocked;
};

module.exports = { awardXp, getLevelForXp };
