const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addGoal,
  getTodayGoals,
  completeGoal,
  deleteGoal,
  getAllGoals
} = require('../controllers/goalController');

router.post('/',              auth, addGoal);
router.get('/today',          auth, getTodayGoals);
router.get('/all',            auth, getAllGoals);
router.put('/:id/complete',   auth, completeGoal);
router.delete('/:id',         auth, deleteGoal);

module.exports = router;