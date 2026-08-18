const express = require('express');
const {
  getExams,
  getExamById,
  createExam,
  updateExam,
  toggleExamStatus,
  deleteExam,
  getExamResults,
  getAttemptDetails,
} = require('../controllers/examController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All exam management routes require admin authentication
router.use(authMiddleware);

router.get('/', getExams);
router.get('/:id', getExamById);
router.post('/', createExam);
router.put('/:id', updateExam);
router.patch('/:id/status', toggleExamStatus);
router.delete('/:id', deleteExam);
router.get('/:id/results', getExamResults);
router.get('/:id/attempts/:attemptId', getAttemptDetails);

module.exports = router;
