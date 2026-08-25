const express = require('express');
const {
  getPublicPracticeExams,
  getPublicExamInfo,
  startPublicExam,
  submitPublicExam,
} = require('../controllers/publicExamController');

const router = express.Router();

// Public student endpoints
router.get('/practice/list', getPublicPracticeExams);
router.get('/:token', getPublicExamInfo);
router.post('/:token/start', startPublicExam);
router.post('/:token/submit', submitPublicExam);

module.exports = router;
