const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const safeUser = {
    id: user._id,
    name: user.name,
    studentId: user.studentId,
    school: user.school,
    grade: user.grade,
    avatar: user.avatar,
    level: user.level,
    xp: user.xp,
    streak: user.currentStreak,
  };

  const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/'
  };
  res.clearCookie('token');
  res.cookie('token', token, cookieOptions);
  res.status(statusCode).json({ success: true, token, user: safeUser });
};

module.exports = { signToken, sendTokenResponse };
