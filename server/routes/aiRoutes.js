const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  askAI,
  getChatHistory,
  clearHistory
} = require('../controllers/aiController');

router.post('/ask',     auth, askAI);
router.get('/history',  auth, getChatHistory);
router.delete('/clear', auth, clearHistory);

module.exports = router;