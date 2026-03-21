const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getJobs)
  .post(protect, authorize('company', 'admin'), createJob);

router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('company', 'admin'), updateJob)
  .delete(protect, authorize('company', 'admin'), deleteJob);

module.exports = router;
