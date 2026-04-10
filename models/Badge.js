const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    icon:     { type: String, required: true },
    name:     { type: String, required: true, unique: true },
    category: { type: String, required: true },
    xp:       { type: Number, default: 25 },
    // condition metadata — evaluated server-side only
    trigger:  { type: String, required: true },   // e.g. 'lesson_complete', 'streak_7'
    threshold:{ type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Badge', badgeSchema);
