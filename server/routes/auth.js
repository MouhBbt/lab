const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');

const inMemoryUsers = [
  {
    id: 'demo-student-1',
    username: 'student_demo',
    email: 'student@lab.local',
    passwordHash: bcrypt.hashSync('student123', 10),
    role: 'student'
  },
  {
    id: 'demo-teacher-1',
    username: 'teacher_demo',
    email: 'teacher@lab.local',
    passwordHash: bcrypt.hashSync('teacher123', 10),
    role: 'teacher'
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

const signToken = (id, role) => jwt.sign(
  { id, role },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '7d' }
);

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, studentProfile } = req.body;

    if (!isDbConnected()) {
      const existingUser = inMemoryUsers.find(u => u.email === email || u.username === username);
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        id: `mem-${Date.now()}`,
        username,
        email,
        passwordHash,
        role
      };
      inMemoryUsers.push(user);

      const token = signToken(user.id, user.role);
      return res.json({ token, user: { id: user.id, username, email, role } });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    if (role === 'student' && studentProfile) {
      const student = new Student({
        userId: user._id,
        name: studentProfile.name,
        school: studentProfile.school,
        wilaya: studentProfile.wilaya,
        commune: studentProfile.commune,
        level: studentProfile.level
      });
      await student.save();
    }

    const token = signToken(user._id, user.role);

    res.json({ token, user: { id: user._id, username, email, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password, role } = req.body;

    if (!isDbConnected()) {
      const user = inMemoryUsers.find(u =>
        (u.email === emailOrUsername || u.username === emailOrUsername) &&
        (!role || u.role === role)
      );
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = signToken(user.id, user.role);
      return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    }
    
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user._id, user.role);

    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
