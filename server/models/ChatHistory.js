const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  message: { type: String, required: true },
  type:    { type: String, enum: ['doubt', 'concept', 'debug', 'summary', 'quiz'], default: 'doubt' }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', ChatSchema);