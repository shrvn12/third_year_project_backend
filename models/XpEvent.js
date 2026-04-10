const mongoose = require('mongoose');

const xpEventSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount:    { type: Number, required: true },
    source:    { type: String, enum: ['lesson', 'quiz', 'game', 'puzzle', 'streak'], required: true },
    sourceId:  { type: mongoose.Schema.Types.ObjectId, required: true },
    awardedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

xpEventSchema.index({ user: 1, awardedAt: -1 });

module.exports = mongoose.model('XpEvent', xpEventSchema);
