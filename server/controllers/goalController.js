const Goal = require('../models/Goal');
const User = require('../models/User');

// Get today's date as string
const getToday = () => new Date().toISOString().split('T')[0];

// Add a goal
exports.addGoal = async (req, res) => {
  try {
    const { title, subject } = req.body;
    const goal = await Goal.create({
      userId: req.user.id,
      title,
      subject: subject || null,
      date: getToday()
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get today's goals
exports.getTodayGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.user.id,
      date: getToday()
    }).populate('subject', 'name color');
    res.json(goals);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark goal as complete
exports.completeGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: true },
      { new: true }
    );
    if (!goal) return res.status(404).json({ msg: 'Goal not found' });

    // Update streak
    await updateStreak(req.user.id);

    res.json(goal);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ msg: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all goals (history)
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id })
      .populate('subject', 'name color')
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Helper — update streak
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  const today = getToday();
  const lastActive = user.lastActive?.toISOString().split('T')[0];

  if (lastActive === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActive === yesterdayStr) {
    await User.findByIdAndUpdate(userId, {
      $inc: { streak: 1 },
      lastActive: new Date()
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      streak: 1,
      lastActive: new Date()
    });
  }
};