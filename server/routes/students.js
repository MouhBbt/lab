const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// Get current student profile
router.get('/me', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', '-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
