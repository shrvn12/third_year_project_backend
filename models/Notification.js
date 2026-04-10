const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, required: true },   // 'badge', 'streak', 'level_up', etc.
    message:   { type: String, required: true },
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
