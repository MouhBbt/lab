const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  experimentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experiment', required: true },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  circuitCorrect: { type: Boolean, default: false },
  quizAnswers: [{ type: Number }],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
