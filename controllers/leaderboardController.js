const User = require('../models/User');
const XpEvent = require('../models/XpEvent');
const { createError } = require('../middleware/errorHandler');

// GET /api/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { scope = 'all', time = 'all', userId } = req.query;
    const requestingUser = await User.findById(userId);
    if (!requestingUser) return next(createError('User not found', 404));

    let filter = {};
    if (scope === 'school') filter.school = requestingUser.school;
    // 'class' scope would also filter by grade within school
    if (scope === 'class') { filter.school = requestingUser.school; filter.grade = requestingUser.grade; }

    let users;

    if (time === 'all') {
      users = await User.find(filter).sort('-xp').limit(50).select('name avatar school grade xp currentStreak');
    } else {
      // For week/month, aggregate XP events
      const days = time === 'week' ? 7 : 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const pipeline = [
        { $match: { awardedAt: { $gte: since } } },
        { $group: { _id: '$user', periodXp: { $sum: '$amount' } } },
        { $sort: { periodXp: -1 } },
        { $limit: 50 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $match: filter.school ? { 'user.school': filter.school } : {} },
      ];

      const results = await XpEvent.aggregate(pipeline);
      users = results.map(r => ({ ...r.user, xp: r.periodXp }));
    }

    const rankings = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      name: u.name,
      avatar: u.avatar,
      school: u.school,
      grade: u.grade,
      xp: u.xp,
      streak: u.currentStreak,
    }));

    const yourRank = rankings.findIndex(r => r.userId?.toString() === userId) + 1;

    res.json({ success: true, rankings, yourRank: yourRank || null, totalPlayers: rankings.length });
  } catch (err) { next(err); }
};

// GET /api/leaderboard/top-mover
exports.getTopMover = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const results = await XpEvent.aggregate([
      { $match: { awardedAt: { $gte: since } } },
      { $group: { _id: '$user', xpGained: { $sum: '$amount' } } },
      { $sort: { xpGained: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
    ]);

    if (!results.length) return res.json({ success: true, player: null });

    const top = results[0];
    res.json({
      success: true,
      player: { name: top.user.name, avatar: top.user.avatar, xpGained: top.xpGained },
    });
  } catch (err) { next(err); }
};
