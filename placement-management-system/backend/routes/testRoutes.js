const express = require('express');
const router = express.Router();
const {
  createTest,
  getTestByJob,
  getTestByToken,
  submitTest,
  getTestResults,
  sendTestLink,
  getMyTests,
} = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin/Company routes
router.post('/', protect, authorize('company', 'admin'), createTest);
router.get('/my', protect, authorize('company', 'admin'), getMyTests);
router.get('/job/:jobId', protect, authorize('company', 'admin'), getTestByJob);
router.get('/:testId/results', protect, authorize('company', 'admin'), getTestResults);
router.post('/:testId/send-link/:applicationId', protect, authorize('company', 'admin'), sendTestLink);

// Student / Public routes (token-based)
router.get('/take/:token', getTestByToken); // public: no auth required to view test
router.post('/take/:token/submit', protect, authorize('student'), submitTest);

module.exports = router;
