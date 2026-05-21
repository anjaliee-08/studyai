const PomodoroSession = require('../models/PomodoroSession');
const Subject = require('../models/Subject');

const getToday = () => new Date().toISOString().split('T')[0];

// Save a completed session
exports.saveSession = async (req, res) => {
  try {
    const { subjectId, duration, type } = req.body;

    const session = await PomodoroSession.create({
      userId: req.user.id,
      subjectId: subjectId || null,
      duration,
      type: type || 'focus',
      date: getToday()
    });

    // If focus session, update subject hours
    if (type === 'focus' && subjectId) {
      const hours = duration / 60;
      await Subject.findByIdAndUpdate(subjectId, {
        $inc: { hoursStudied: hours }
      });
    }

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get today's sessions
exports.getTodaySessions = async (req, res) => {
  try {
    const sessions = await PomodoroSession.find({
      userId: req.user.id,
      date: getToday()
    }).populate('subjectId', 'name color');

    const focusSessions = sessions.filter(s => s.type === 'focus');
    const totalMinutes = focusSessions.reduce((acc, s) => acc + s.duration, 0);

    res.json({
      sessions,
      totalPomodoros: focusSessions.length,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all sessions (weekly stats)
exports.getWeeklyStats = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const sessions = await PomodoroSession.find({
      userId: req.user.id,
      date: { $in: days },
      type: 'focus'
    });

    const stats = days.map(day => {
      const daySessions = sessions.filter(s => s.date === day);
      const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
      return {
        date: day,
        pomodoros: daySessions.length,
        minutes: totalMinutes,
        hours: (totalMinutes / 60).toFixed(1)
      };
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    await PomodoroSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    res.json({ msg: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};