const router = require('express').Router();
const {
  getCurriculum, getUnit,
  getLessons, getLesson, startLesson, updateProgress,
} = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

// Curriculum
router.get('/curriculum',                protect, getCurriculum);
router.get('/curriculum/units/:unitId',  protect, getUnit);

// Lessons
router.get('/lessons',                          protect, getLessons);
router.get('/lessons/:lessonId',                protect, getLesson);
router.post('/lessons/:lessonId/start',         protect, startLesson);
router.patch('/lessons/:lessonId/progress',     protect, updateProgress);

module.exports = router;
