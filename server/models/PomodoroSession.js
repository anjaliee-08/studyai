const mongoose = require('mongoose');

const PomodoroSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  duration:  { type: Number, required: true },
  type:      { type: String, enum: ['focus', 'break'], default: 'focus' },
  date:      { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PomodoroSession', PomodoroSchema);