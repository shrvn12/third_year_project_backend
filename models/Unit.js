const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    title:         { type: String, required: true },
    description:   { type: String, default: '' },
    gradeRange:    { min: { type: Number }, max: { type: Number } },
    difficulty:    { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }],
    order:         { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Unit', unitSchema);
