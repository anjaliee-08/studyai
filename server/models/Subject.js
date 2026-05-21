const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true },
  color:        { type: String, default: '#378ADD' },
  hoursStudied: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);