const express = require('express');
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestions,
} = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All question routes require admin authentication
router.use(authMiddleware);

router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.post('/import', importQuestions);

module.exports = router;
