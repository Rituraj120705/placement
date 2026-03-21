const express = require('express');
const router = express.Router();
const { submitApplication, getMyApplications, getJobApplications, updateApplicationStatus, getAllApplications, messageShortlistedStudents } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, authorize('student'), submitApplication);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('company', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);
router.post('/job/:jobId/message-shortlisted', protect, authorize('company', 'admin'), messageShortlistedStudents);
router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;
