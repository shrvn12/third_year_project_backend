const Game = require('../models/Game');
const { awardXp } = require('../utils/xp');
const { createError } = require('../middleware/errorHandler');

// GET /api/games
exports.getGames = async (req, res, next) => {
  try {
    const { difficulty, concept } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (concept) filter.concept = concept;
    const games = await Game.find(filter).select('-config -howTo');
    res.json({ success: true, games });
  } catch (err) { next(err); }
};

// GET /api/games/:gameId
exports.getGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) return next(createError('Game not found', 404));
    res.json({ success: true, game });
  } catch (err) { next(err); }
};

// POST /api/games/:gameId/complete
exports.completeGame = async (req, res, next) => {
  try {
    const { userId, stars, timeTaken } = req.body;
    if (!stars || stars < 1 || stars > 3) return next(createError('stars must be 1–3'));

    const game = await Game.findById(req.params.gameId);
    if (!game) return next(createError('Game not found', 404));

    const xpEarned = Math.round(game.xp * (stars / 3));
    const { badgesUnlocked } = await awardXp(userId, xpEarned, 'game', game._id);

    res.json({ success: true, xpEarned, badgesUnlocked, newBestStars: stars });
  } catch (err) { next(err); }
};
