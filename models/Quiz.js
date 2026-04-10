const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text:        { type: String, required: true },
  options:     [{ type: String }],
  correct:     { type: Number, required: true },   // index of correct option
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    unit:      { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    questions: [questionSchema],
    xpTotal:   { type: Number, default: 100 },
    locked:    { type: Boolean, default: false },
    isDaily:   { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },       // for daily quizzes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
