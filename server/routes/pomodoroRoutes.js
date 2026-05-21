const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  saveSession,
  getTodaySessions,
  getWeeklyStats,
  deleteSession
} = require('../controllers/pomodoroController');

router.post('/',         auth, saveSession);
router.get('/today',     auth, getTodaySessions);
router.get('/weekly',    auth, getWeeklyStats);
router.delete('/:id',    auth, deleteSession);

module.exports = router;