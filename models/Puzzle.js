const mongoose = require('mongoose');

// 'data' shape varies by type:
//   unjumbler  -> { lines: [] }
//   bug-hunt   -> { code: [], bugLine: Number }
//   matcher    -> { scratch: [], python: [], correctPairs: {} }

const puzzleSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    type:        { type: String, enum: ['unjumbler', 'bug-hunt', 'matcher'], required: true },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    instruction: { type: String, default: '' },
    xp:          { type: Number, default: 60 },
    locked:      { type: Boolean, default: false },
    data:        { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Puzzle', puzzleSchema);
