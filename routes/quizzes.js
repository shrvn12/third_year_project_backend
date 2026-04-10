const router = require('express').Router();
const { getQuizzes, getDailyQuiz, getQuiz, submitQuiz, getResults } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

// NOTE: /daily must come before /:quizId to avoid being matched as an id
router.get('/daily',                          protect, getDailyQuiz);
router.get('/',                               protect, getQuizzes);
router.get('/:quizId',                        protect, getQuiz);
router.post('/:quizId/submit',                protect, submitQuiz);
router.get('/:quizId/results/:userId',        protect, getResults);

module.exports = router;
