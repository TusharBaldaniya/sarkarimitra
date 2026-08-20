const express = require('express');
const {
  getPublicExamInfo,
  startPublicExam,
  submitPublicExam,
} = require('../controllers/publicExamController');

const router = express.Router();

// Rate limiters temporarily commented out as requested
// const rateLimit = require('express-rate-limit');
// const startLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 15,
//   message: {
//     success: false,
//     message: 'Too many exam start requests from this IP. Please try again after 15 minutes.',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// const submitLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 15,
//   message: {
//     success: false,
//     message: 'Too many exam submissions from this IP. Please wait a moment before trying again.',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Public student endpoints (Rate limiting disabled)
router.get('/:token', getPublicExamInfo);
router.post('/:token/start', startPublicExam);
router.post('/:token/submit', submitPublicExam);

module.exports = router;
