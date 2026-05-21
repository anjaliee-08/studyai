const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  addSubject,
  getSubjects,
  updateHours,
  deleteSubject
} = require('../controllers/subjectController');

router.post('/',              auth, addSubject);
router.get('/',               auth, getSubjects);
router.put('/:id/hours',      auth, updateHours);
router.delete('/:id',         auth, deleteSubject);

module.exports = router;