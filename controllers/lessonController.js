const Lesson = require('../models/Lesson');
const Unit = require('../models/Unit');
const LessonProgress = require('../models/LessonProgress');
const { awardXp } = require('../utils/xp');
const { createError } = require('../middleware/errorHandler');

// GET /api/curriculum
exports.getCurriculum = async (req, res, next) => {
  try {
    const { gradeMin, gradeMax } = req.query;
    const filter = {};
    if (gradeMin) filter['gradeRange.min'] = { $gte: Number(gradeMin) };
    if (gradeMax) filter['gradeRange.max'] = { $lte: Number(gradeMax) };

    const units = await Unit.find(filter).sort('order');
    const lessons = await Lesson.find().sort('order').select('id title duration xp order unit');

    const result = units.map(u => ({
      ...u.toObject(),
      lessons: lessons.filter(l => l.unit.toString() === u._id.toString()),
    }));

    res.json({ success: true, units: result });
  } catch (err) { next(err); }
};

// GET /api/curriculum/units/:unitId
exports.getUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findById(req.params.unitId).populate('prerequisites');
    if (!unit) return next(createError('Unit not found', 404));
    const lessons = await Lesson.find({ unit: unit._id }).sort('order');
    res.json({ success: true, unit: { ...unit.toObject(), lessons } });
  } catch (err) { next(err); }
};

// GET /api/lessons
exports.getLessons = async (req, res, next) => {
  try {
    const { unitId, page = 1, limit = 20 } = req.query;
    const filter = unitId ? { unit: unitId } : {};
    const lessons = await Lesson.find(filter)
      .sort('order')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('unit', 'title');

    res.json({ success: true, lessons });
  } catch (err) { next(err); }
};

// GET /api/lessons/:lessonId
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId).populate('unit', 'title');
    if (!lesson) return next(createError('Lesson not found', 404));

    // Attach next/prev lesson ids
    const siblings = await Lesson.find({ unit: lesson.unit }).sort('order').select('_id order');
    const idx = siblings.findIndex(s => s._id.toString() === lesson._id.toString());
    const prevLessonId = idx > 0 ? siblings[idx - 1]._id : null;
    const nextLessonId = idx < siblings.length - 1 ? siblings[idx + 1]._id : null;

    res.json({ success: true, lesson: { ...lesson.toObject(), prevLessonId, nextLessonId } });
  } catch (err) { next(err); }
};

// POST /api/lessons/:lessonId/start
exports.startLesson = async (req, res, next) => {
  try {
    const { userId } = req.body;
    let record = await LessonProgress.findOne({ user: userId, lesson: req.params.lessonId });
    if (!record) {
      record = await LessonProgress.create({ user: userId, lesson: req.params.lessonId });
    }
    res.status(201).json({ success: true, progressRecord: record });
  } catch (err) { next(err); }
};

// PATCH /api/lessons/:lessonId/progress
exports.updateProgress = async (req, res, next) => {
  try {
    const { userId, progress, completed } = req.body;
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return next(createError('Lesson not found', 404));

    const record = await LessonProgress.findOneAndUpdate(
      { user: userId, lesson: req.params.lessonId },
      {
        progress,
        completed,
        ...(completed && { completedAt: new Date() }),
      },
      { new: true, upsert: true }
    );

    let xpAwarded, badgesUnlocked;
    if (completed && record.xpAwarded === 0) {
      const result = await awardXp(userId, lesson.xp, 'lesson', lesson._id);
      xpAwarded = result.newTotal;
      badgesUnlocked = result.badgesUnlocked;
      record.xpAwarded = lesson.xp;
      await record.save();
    }

    res.json({ success: true, progressRecord: record, xpAwarded, badgesUnlocked });
  } catch (err) { next(err); }
};
