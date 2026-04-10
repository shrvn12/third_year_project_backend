const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers:     [{ questionId: mongoose.Schema.Types.ObjectId, selectedIndex: Number }],
    score:       { type: Number, required: true },
    total:       { type: Number, required: true },
    percentage:  { type: Number, required: true },
    xpEarned:    { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
