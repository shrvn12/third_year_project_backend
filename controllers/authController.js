const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');
const { createError } = require('../middleware/errorHandler');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    let { name, studentId, school, grade, password } = req.body;
    if (!name || !studentId || !school || !grade || !password)
      return next(createError('Please provide all required fields'));
    studentId = studentId.trim().toLowerCase();
    const existing = await User.findOne({ studentId });
    if (existing) return next(createError('A user with that student ID already exists', 409));

    const user = await User.create({ name, studentId, school, grade, password });
    sendTokenResponse(user, 201, res);
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password)
      return next(createError('Please provide student ID and password'));

    const user = await User.findOne({ studentId: studentId.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return next(createError('Invalid credentials', 401));

    sendTokenResponse(user, 200, res);
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  // JWT is stateless — client drops the token; server just confirms
  res.json({ success: true });
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
