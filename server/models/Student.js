const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  school: { type: String, required: true },
  wilaya: { type: String, required: true },
  commune: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['primary', 'middle', 'high'], 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
