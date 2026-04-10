const Puzzle = require('../models/Puzzle');
const { awardXp } = require('../utils/xp');
const { createError } = require('../middleware/errorHandler');

// GET /api/puzzles
exports.getPuzzles = async (req, res, next) => {
  try {
    const { type, difficulty } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    const puzzles = await Puzzle.find(filter).select('-data');
    res.json({ success: true, puzzles });
  } catch (err) { next(err); }
};

// GET /api/puzzles/:puzzleId
exports.getPuzzle = async (req, res, next) => {
  try {
    const puzzle = await Puzzle.findById(req.params.puzzleId);
    if (!puzzle) return next(createError('Puzzle not found', 404));
    res.json({ success: true, puzzle });
  } catch (err) { next(err); }
};

// POST /api/puzzles/:puzzleId/submit
exports.submitPuzzle = async (req, res, next) => {
  try {
    const { userId, answer } = req.body;
    const puzzle = await Puzzle.findById(req.params.puzzleId);
    if (!puzzle) return next(createError('Puzzle not found', 404));

    const correct = checkAnswer(puzzle, answer);
    let xpEarned = 0;
    let badgesUnlocked = [];

    if (correct) {
      const result = await awardXp(userId, puzzle.xp, 'puzzle', puzzle._id);
      xpEarned = puzzle.xp;
      badgesUnlocked = result.badgesUnlocked;
    }

    res.json({ success: true, correct, xpEarned, badgesUnlocked });
  } catch (err) { next(err); }
};

// ── Answer validators ─────────────────────────────────────────────────────────

function checkAnswer(puzzle, answer) {
  switch (puzzle.type) {
    case 'unjumbler': {
      // answer: { order: [id, id, ...] }
      const correct = puzzle.data.lines.map(l => l.id);
      return JSON.stringify(answer.order) === JSON.stringify(correct);
    }
    case 'bug-hunt': {
      // answer: { selectedLine: Number }
      return answer.selectedLine === puzzle.data.bugLine;
    }
    case 'matcher': {
      // answer: { pairs: { "0": 1, "1": 2, ... } }
      const correctPairs = puzzle.data.correctPairs;
      return Object.keys(correctPairs).every(
        k => String(answer.pairs[k]) === String(correctPairs[k])
      );
    }
    default:
      return false;
  }
}
