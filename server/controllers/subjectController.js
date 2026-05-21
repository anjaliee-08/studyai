const Subject = require('../models/Subject');

// Add a subject
exports.addSubject = async (req, res) => {
  try {
    const { name, color } = req.body;
    const subject = await Subject.create({
      userId: req.user.id,
      name,
      color
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all subjects for logged in user
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update hours studied
exports.updateHours = async (req, res) => {
  try {
    const { hours } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $inc: { hoursStudied: hours } },
      { new: true }
    );
    if (!subject) return res.status(404).json({ msg: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ msg: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};