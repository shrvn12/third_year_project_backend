const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    icon:        { type: String, default: '' },
    concept:     { type: String, required: true },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    xp:          { type: Number, default: 75 },
    ageMin:      { type: Number, default: 6 },
    locked:      { type: Boolean, default: false },
    howTo:       { type: String, default: '' },
    config:      { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Game', gameSchema);
