const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Result = require('../models/Result');
const Student = require('../models/Student');

// Submit experiment result
router.post('/', auth, async (req, res) => {
  try {
    const { experimentId, completed, score, circuitCorrect, quizAnswers } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let result = await Result.findOne({ studentId: student._id, experimentId });
    if (result) {
      result.completed = completed;
      result.score = score;
      result.circuitCorrect = circuitCorrect;
      result.quizAnswers = quizAnswers;
      result.date = new Date();
      await result.save();
    } else {
      result = new Result({ studentId: student._id, experimentId, completed, score, circuitCorrect, quizAnswers });
      await result.save();
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's results
router.get('/my', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const results = await Result.find({ studentId: student._id }).populate('experimentId');
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
