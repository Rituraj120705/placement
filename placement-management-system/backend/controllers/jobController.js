const Job = require('../models/Job');

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .populate('company', 'companyName companyDescription');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in company's jobs
// @route   GET /api/jobs/company/me
// @access  Private (Company)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user._id })
      .sort({ createdAt: -1 })
      .populate('company', 'companyName companyDescription');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'companyName companyDescription website');
    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Company, Admin)
const createJob = async (req, res) => {
  try {
    const { title, description, requirements, location, salary, type, deadline, cgpa, skills, compensationDetails } = req.body;
    
    // Ensure company or admin is creating
    const companyId = req.user.role === 'admin' ? req.body.companyId : req.user._id;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID required' });
    }

    const jobData = {
      company: companyId,
      title,
      description,
      requirements,
      location,
      salary,
      type,
      deadline,
      cgpa,
      skills,
      compensationDetails,
    };

    if (req.file) {
      jobData.material = `/uploads/${req.file.filename}`;
    }

    const job = await Job.create(jobData);

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Company, Admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership or admin
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.material = `/uploads/${req.file.filename}`;
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Company, Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await Job.deleteOne({ _id: job._id });
    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getMyJobs, getJobById, createJob, updateJob, deleteJob };
