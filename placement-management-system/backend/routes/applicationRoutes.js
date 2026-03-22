const express = require('express');
const router = express.Router();
const { submitApplication, getMyApplications, getJobApplications, updateApplicationStatus, getAllApplications, messageShortlistedStudents, messageStudent } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });


router.post('/:jobId', protect, authorize('student'), upload.fields([
  { name: 'tenthMarksheet', maxCount: 1 },
  { name: 'twelfthMarksheet', maxCount: 1 },
  { name: 'collegeMarksheet', maxCount: 1 },
  { name: 'certificates', maxCount: 1 }
]), submitApplication);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('company', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('company', 'admin'), updateApplicationStatus);
router.post('/job/:jobId/message-shortlisted', protect, authorize('company', 'admin'), messageShortlistedStudents);
router.post('/:id/message', protect, authorize('company', 'admin'), messageStudent);
router.get('/', protect, authorize('admin'), getAllApplications);

module.exports = router;
