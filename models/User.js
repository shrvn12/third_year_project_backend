const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, sparse: true },
    school:    { type: String, required: true },
    grade:     { type: Number, required: true, min: 3, max: 8 },
    password:  { type: String, required: true, minlength: 6, select: false },
    avatar:    { type: String, default: '' },

    // XP & levelling
    xp:    { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lessonsCompleted: { type: Number, default: 0 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],

    // Streak
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCheckIn:   { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare candidate password
userSchema.methods.matchPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
