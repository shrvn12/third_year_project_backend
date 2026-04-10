const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const { createError } = require('../middleware/errorHandler');

const MILESTONES = [
  { level: 1,  name: 'Beginner',    xp: 0 },
  { level: 2,  name: 'Explorer',    xp: 100 },
  { level: 3,  name: 'Learner',     xp: 250 },
  { level: 5,  name: 'Achiever',    xp: 900 },
  { level: 8,  name: 'Expert',      xp: 2800 },
  { level: 10, name: 'Master',      xp: 5000 },
];

// GET /api/achievements/:userId
exports.getAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(createError('User not found', 404));

    const [allBadges, earnedBadges] = await Promise.all([
      Badge.find(),
      UserBadge.find({ user: user._id }).populate('badge'),
    ]);

    const earnedMap = {};
    earnedBadges.forEach(ub => { earnedMap[ub.badge._id.toString()] = ub.earnedOn; });

    const badges = allBadges.map(b => ({
      id: b._id,
      icon: b.icon,
      name: b.name,
      category: b.category,
      xp: b.xp,
      earned: !!earnedMap[b._id.toString()],
      earnedOn: earnedMap[b._id.toString()] || null,
    }));

    const milestones = MILESTONES.map(m => ({
      ...m,
      completed: user.xp >= m.xp,
    }));

    res.json({ success: true, badges, milestones });
  } catch (err) { next(err); }
};

// GET /api/achievements/challenges/weekly
exports.getWeeklyChallenges = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    if (!user) return next(createError('User not found', 404));

    // Placeholder weekly challenges — replace with DB-driven challenges as needed
    const challenges = [
      { id: '1', icon: '📚', label: 'Complete 3 lessons',  xp: 150, progress: 0, total: 3,  unit: 'lessons', done: false },
      { id: '2', icon: '🎮', label: 'Play 2 games',        xp: 100, progress: 0, total: 2,  unit: 'games',   done: false },
      { id: '3', icon: '🔥', label: 'Keep a 5-day streak', xp: 200, progress: user.currentStreak, total: 5, unit: 'days', done: user.currentStreak >= 5 },
    ];

    res.json({ success: true, challenges, weeklyXp: user.xp, weeklyGoal: 500 });
  } catch (err) { next(err); }
};
