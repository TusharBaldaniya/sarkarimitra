const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getPublicExamInfo,
  startPublicExam,
  submitPublicExam,
} = require('../controllers/publicExamController');

const router = express.Router();

// Rate limiter for starting exams (max 15 attempts per 15 mins per IP)
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

// Rate limiter for submitting exams (max 15 submissions per 15 mins per IP)
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

// Public student endpoints
router.get('/:token', getPublicExamInfo);
router.post('/:token/start', startLimiter, startPublicExam);
router.post('/:token/submit', submitLimiter, submitPublicExam);

module.exports = router;
