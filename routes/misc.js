const router = require('express').Router();
const { protect } = require('../middleware/auth');

// Games
const { getGames, getGame, completeGame } = require('../controllers/gameController');
router.get('/games',                   protect, getGames);
router.get('/games/:gameId',           protect, getGame);
router.post('/games/:gameId/complete', protect, completeGame);

// Puzzles
const { getPuzzles, getPuzzle, submitPuzzle } = require('../controllers/puzzleController');
router.get('/puzzles',                     protect, getPuzzles);
router.get('/puzzles/:puzzleId',           protect, getPuzzle);
router.post('/puzzles/:puzzleId/submit',   protect, submitPuzzle);

// Achievements
const { getAchievements, getWeeklyChallenges } = require('../controllers/achievementsController');
router.get('/achievements/:userId',           protect, getAchievements);
router.get('/achievements/challenges/weekly', protect, getWeeklyChallenges);

// Leaderboard
const { getLeaderboard, getTopMover } = require('../controllers/leaderboardController');
router.get('/leaderboard',            protect, getLeaderboard);
router.get('/leaderboard/top-mover',  protect, getTopMover);

// Streaks
const { checkIn, getStreak } = require('../controllers/streakController');
router.post('/streaks/check-in', protect, checkIn);
router.get('/streaks/:userId',   protect, getStreak);

// Notifications
const { getNotifications, markRead } = require('../controllers/notificationController');
router.get('/notifications/:userId',       protect, getNotifications);
router.patch('/notifications/:userId/read',protect, markRead);

module.exports = router;
