const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const LessonProgress = require('../models/LessonProgress');
const XpEvent = require('../models/XpEvent');
const { createError } = require('../middleware/errorHandler');

// GET /api/profile/:userId
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(createError('User not found', 404));

    const [lessonsCompleted, recentBadges, xpEvents] = await Promise.all([
      LessonProgress.countDocuments({ user: user._id, completed: true }),
      UserBadge.find({ user: user._id }).sort('-earnedOn').limit(5).populate('badge'),
      XpEvent.find({ user: user._id }).sort('-awardedAt').limit(100),
    ]);

    // Build weekly activity (last 7 days)
    const weeklyActivity = buildWeeklyActivity(xpEvents);

    res.json({
      success: true,
      user,
      stats: {
        lessonsCompleted,
        totalXp: user.xp,
        streak: user.currentStreak,
      },
      recentBadges: recentBadges.map(ub => ({
        id: ub.badge._id,
        icon: ub.badge.icon,
        name: ub.badge.name,
        category: ub.badge.category,
        xp: ub.badge.xp,
        earnedOn: ub.earnedOn,
      })),
      weeklyActivity,
    });
  } catch (err) { next(err); }
};

// PATCH /api/profile/:userId
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['avatar', 'name', 'school', 'grade'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.params.userId, updates, {
      new: true, runValidators: true,
    });
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// GET /api/profile/:userId/activity
exports.getActivity = async (req, res, next) => {
  try {
    const { range = 'week' } = req.query;
    const days = range === 'month' ? 30 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await XpEvent.find({
      user: req.params.userId,
      awardedAt: { $gte: since },
    }).sort('awardedAt');

    const activity = buildActivityMap(events, days);
    res.json({ success: true, activity });
  } catch (err) { next(err); }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildWeeklyActivity(events) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const map = {};
  days.forEach(d => (map[d] = 0));

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  events.filter(e => e.awardedAt >= cutoff).forEach(e => {
    const day = days[new Date(e.awardedAt).getDay()];
    map[day] += e.amount;
  });

  return days.map(day => ({ day, xp: map[day] }));
}

function buildActivityMap(events, days) {
  const map = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = { date: d.toISOString().slice(0, 10), xp: 0, lessonsCompleted: 0, gamesPlayed: 0 };
  }
  events.forEach(e => {
    const key = new Date(e.awardedAt).toISOString().slice(0, 10);
    if (map[key]) {
      map[key].xp += e.amount;
      if (e.source === 'lesson') map[key].lessonsCompleted++;
      if (e.source === 'game') map[key].gamesPlayed++;
    }
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}
