const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Submit an application
// @route   POST /api/applications/:jobId
// @access  Private (Student)
const submitApplication = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already applied for this job' });

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location status type');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a job (Company view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Company, Admin)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email major graduationYear skills resumeUrl');
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Company, Admin)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'shortlisted', 'rejected', 'hired'
    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.status = status;
    const updatedApplication = await application.save();

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private (Admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('job', 'title company')
      .populate('applicant', 'name email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Message all shortlisted students for a job
// @route   POST /api/applications/job/:jobId/message-shortlisted
// @access  Private (Company)
const messageShortlistedStudents = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { message } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ job: jobId, status: 'shortlisted' });
    
    if (applications.length === 0) {
      return res.status(400).json({ message: 'No shortlisted students found for this job.' });
    }

    for (let app of applications) {
      app.updates.push({ message });
      await app.save();
    }

    res.json({ message: `Message successfully sent to ${applications.length} shortlisted student(s).` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitApplication, getMyApplications, getJobApplications, updateApplicationStatus, getAllApplications, messageShortlistedStudents };
