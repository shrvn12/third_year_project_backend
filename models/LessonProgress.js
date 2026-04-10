const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lesson:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    progress:  { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
