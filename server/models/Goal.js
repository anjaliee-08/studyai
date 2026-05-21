const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  completed: { type: Boolean, default: false },
  date:      { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Goal', GoalSchema);