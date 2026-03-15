const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['primary', 'middle', 'high'], required: true },
  description: { type: String },
  imageUrl: { type: String, default: '' },
  instructions: [{ type: String }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Experiment', experimentSchema);
