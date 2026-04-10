const Notification = require('../models/Notification');
const { createError } = require('../middleware/errorHandler');

// GET /api/notifications/:userId
exports.getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { user: req.params.userId };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter).sort('-createdAt').limit(50);
    res.json({ success: true, notifications });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:userId/read
exports.markRead = async (req, res, next) => {
  try {
    const { notificationIds } = req.body;
    if (!Array.isArray(notificationIds) || !notificationIds.length)
      return next(createError('notificationIds array required'));

    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, user: req.params.userId },
      { read: true }
    );

    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (err) { next(err); }
};
