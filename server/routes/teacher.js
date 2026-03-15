const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const Result = require('../models/Result');
const User = require('../models/User');

// Middleware to check teacher role
const teacherOnly = (req, res, next) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Teachers only' });
  next();
};

// Get all students with filters
router.get('/students', auth, teacherOnly, async (req, res) => {
  try {
    const { wilaya, commune, school, level } = req.query;
    const filter = {};
    if (wilaya) filter.wilaya = wilaya;
    if (commune) filter.commune = commune;
    if (school) filter.school = school;
    if (level) filter.level = level;
    const students = await Student.find(filter).populate('userId', '-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all results (teacher view)
router.get('/results', auth, teacherOnly, async (req, res) => {
  try {
    const results = await Result.find()
      .populate({ path: 'studentId', populate: { path: 'userId', select: '-password' } })
      .populate('experimentId')
      .sort({ date: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
