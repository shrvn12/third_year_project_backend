const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { awardXp } = require('../utils/xp');
const { createError } = require('../middleware/errorHandler');

// GET /api/quizzes
exports.getQuizzes = async (req, res, next) => {
  try {
    const { unitId } = req.query;
    const filter = { isDaily: false };
    if (unitId) filter.unit = unitId;
    const quizzes = await Quiz.find(filter).populate('unit', 'title').select('-questions');
    res.json({ success: true, quizzes });
  } catch (err) { next(err); }
};

// GET /api/quizzes/daily
exports.getDailyQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ isDaily: true, expiresAt: { $gt: new Date() } });
    if (!quiz) return next(createError('No daily quiz available', 404));
    res.json({ success: true, quiz });
  } catch (err) { next(err); }
};

// GET /api/quizzes/:quizId
exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('unit', 'title');
    if (!quiz) return next(createError('Quiz not found', 404));
    res.json({ success: true, quiz });
  } catch (err) { next(err); }
};

// POST /api/quizzes/:quizId/submit
exports.submitQuiz = async (req, res, next) => {
  try {
    const { userId, answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return next(createError('Quiz not found', 404));

    let score = 0;
    quiz.questions.forEach(q => {
      const ans = answers.find(a => a.questionId.toString() === q._id.toString());
      if (ans && ans.selectedIndex === q.correct) score++;
    });

    const total = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);
    const xpEarned = Math.round((percentage / 100) * quiz.xpTotal);

    await QuizAttempt.create({ user: userId, quiz: quiz._id, answers, score, total, percentage, xpEarned });

    const { badgesUnlocked } = await awardXp(userId, xpEarned, 'quiz', quiz._id);

    res.json({ success: true, score, total, percentage, xpEarned, badgesUnlocked });
  } catch (err) { next(err); }
};

// GET /api/quizzes/:quizId/results/:userId
exports.getResults = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({
      quiz: req.params.quizId,
      user: req.params.userId,
    }).sort('-submittedAt');
    res.json({ success: true, attempts });
  } catch (err) { next(err); }
};
