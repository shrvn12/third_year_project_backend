const User = require('../models/User');
const { awardXp } = require('../utils/xp');
const { createError } = require('../middleware/errorHandler');

const STREAK_XP = 20; // XP per daily check-in

// POST /api/streaks/check-in
exports.checkIn = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return next(createError('User not found', 404));

    const today = new Date().toISOString().slice(0, 10);
    const lastCheckIn = user.lastCheckIn
      ? new Date(user.lastCheckIn).toISOString().slice(0, 10)
      : null;

    // Idempotent — ignore duplicate calls on same day
    if (lastCheckIn === today) {
      return res.json({
        success: true,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        xpAwarded: 0,
        duplicate: true,
      });
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastCheckIn === yesterday) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1; // streak broken
    }

    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    user.lastCheckIn = new Date();
    await user.save();

    const { badgesUnlocked } = await awardXp(userId, STREAK_XP, 'streak', user._id);

    res.json({
      success: true,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      xpAwarded: STREAK_XP,
      badgeUnlocked: badgesUnlocked[0] || null,
    });
  } catch (err) { next(err); }
};

// GET /api/streaks/:userId
exports.getStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('currentStreak longestStreak lastCheckIn');
    if (!user) return next(createError('User not found', 404));

    // Build last 30 days of check-in history
    // In a real app you'd store this in a separate collection; here we derive from lastCheckIn
    res.json({
      success: true,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastCheckIn: user.lastCheckIn,
      history: [], // extend with a StreakHistory model if needed
    });
  } catch (err) { next(err); }
};
