const express = require('express');
const router = express.Router();
const { getJobs, getMyJobs, getJobById, createJob, updateJob, deleteJob, toggleJobStatus } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getJobs)
  .post(protect, authorize('company', 'admin'), upload.single('material'), createJob);

// Ensure this specific static path route comes before the parameterized /:id route!
router.get('/company/me', protect, authorize('company'), getMyJobs);

router.put('/:id/toggle-status', protect, authorize('company', 'admin'), toggleJobStatus);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('company', 'admin'), upload.single('material'), updateJob)
  .delete(protect, authorize('company', 'admin'), deleteJob);

module.exports = router;
