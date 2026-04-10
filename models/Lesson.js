// const mongoose = require('mongoose');

// const lessonSchema = new mongoose.Schema(
//   {
//     title:      { type: String, required: true },
//     unit:       { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
//     content:    { type: String, default: '' },
//     codeExample:{ type: String, default: '' },
//     duration:   { type: Number, default: 10 },   // minutes
//     xp:         { type: Number, default: 50 },
//     order:      { type: Number, required: true },
//     locked:     { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Lesson', lessonSchema);


const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
  type: { type: String, required: true },

  // common fields
  text: String,
  title: String,

  // callout
  kind: String,
  emoji: String,

  // illustration
  caption: String,
  alt: String,

  // analogy
  scenario: String,
  connection: String,

  // code
  language: String,
  label: String,
  code: String,
  output: String,
  notes: [
    {
      token: String,
      explanation: String
    }
  ],

  // steps
  items: [String],

  // comparison
  left: {
    lang: String,
    emoji: String,
    code: String
  },
  right: {
    lang: String,
    emoji: String,
    code: String
  },
  note: String,

  // mistake
  items: [
    {
      wrong: String,
      error: String,
      fix: String,
      explanation: String
    }
  ],

  // challenge
  difficulty: String,
  prompt: String,
  hint: String,
  starterCode: String,
  solution: String
}, { _id: false });


const QuizSchema = new mongoose.Schema({
  id: String,
  questions: [
    {
      id: String,
      text: String,
      options: [String],
      correct: Number,
      explanation: String
    }
  ]
}, { _id: false });


const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },

  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },

  order: { type: Number, required: true },

  content: [ContentBlockSchema],

  objectives: [String],

  meta: {
    title: String,
    subtitle: String,
    unit: String,
    grade: [Number],
    duration: Number,
    xp: Number,
    difficulty: String,
    tags: [String],
    prerequisites: [String]
  },

  quiz: QuizSchema,

  navigation: {
    prevLesson: {
      id: String,
      title: String
    },
    nextLesson: {
      id: String,
      title: String
    }
  },

  duration: { type: Number, default: 10 },
  xp: { type: Number, default: 50 },
  locked: { type: Boolean, default: false },

  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Lesson', LessonSchema);