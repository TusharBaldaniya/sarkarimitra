const express = require('express');
const {
  getPublicExamInfo,
  startPublicExam,
  submitPublicExam,
} = require('../controllers/publicExamController');

const router = express.Router();

// Public student endpoints (NO admin authentication required)
router.get('/:token', getPublicExamInfo);
router.post('/:token/start', startPublicExam);
router.post('/:token/submit', submitPublicExam);

module.exports = router;
