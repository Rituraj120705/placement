const Test = require('../models/Test');
const TestResult = require('../models/TestResult');
const Application = require('../models/Application');
const Job = require('../models/Job');
const crypto = require('crypto');

// @desc    Create a test for a job
// @route   POST /api/tests
// @access  Private (Company, Admin)
const createTest = async (req, res) => {
  try {
    const { title, jobId, duration, passingPercentage, questions } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Only company owner or admin can create test for a job
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete existing test for this job if any (one test per job)
    await Test.deleteOne({ job: jobId });

    const accessToken = crypto.randomUUID();

    const test = await Test.create({
      title,
      job: jobId,
      createdBy: req.user._id,
      duration: duration || 30,
      passingPercentage: passingPercentage || 60,
      questions,
      accessToken,
    });

    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get test for a job (admin/company view WITH correct answers)
// @route   GET /api/tests/job/:jobId
// @access  Private (Company, Admin)
const getTestByJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const test = await Test.findOne({ job: req.params.jobId });
    if (!test) return res.status(404).json({ message: 'No test found for this job' });

    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get test via shareable token (student view — NO correct answers)
// @route   GET /api/tests/take/:token
// @access  Public
const getTestByToken = async (req, res) => {
  try {
    const test = await Test.findOne({ accessToken: req.params.token })
      .populate('job', 'title company')
      .populate('createdBy', 'companyName name');

    if (!test) return res.status(404).json({ message: 'Invalid or expired test link' });

    // Strip correct answers before sending to student
    const safeQuestions = test.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    res.json({
      _id: test._id,
      title: test.title,
      duration: test.duration,
      passingPercentage: test.passingPercentage,
      totalQuestions: test.questions.length,
      questions: safeQuestions,
      job: test.job,
      createdBy: test.createdBy,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit test answers (auto-evaluate)
// @route   POST /api/tests/take/:token/submit
// @access  Private (Student)
const submitTest = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionIndex, selectedOption }]

    const test = await Test.findOne({ accessToken: req.params.token });
    if (!test) return res.status(404).json({ message: 'Invalid test link' });

    // Check if student already submitted
    const existing = await TestResult.findOne({ test: test._id, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already submitted this test' });

    // Auto-evaluate
    let score = 0;
    const totalMarks = test.questions.length;

    test.questions.forEach((q, idx) => {
      const answer = answers.find(a => a.questionIndex === idx);
      if (answer && answer.selectedOption === q.correctAnswer) {
        score++;
      }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = percentage >= test.passingPercentage;

    const result = await TestResult.create({
      test: test._id,
      student: req.user._id,
      answers,
      score,
      totalMarks,
      percentage,
      passed,
    });

    // Update the student's application to mark test as completed
    await Application.findOneAndUpdate(
      { job: test.job, applicant: req.user._id },
      { testCompleted: true }
    );

    res.status(201).json({
      message: 'Test submitted successfully!',
      score,
      totalMarks,
      percentage,
      passed,
      passingPercentage: test.passingPercentage,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted this test' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all results for a test
// @route   GET /api/tests/:testId/results
// @access  Private (Company, Admin)
const getTestResults = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate('job');
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (test.job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const results = await TestResult.find({ test: test._id })
      .populate('student', 'name email major graduationYear')
      .sort({ score: -1 });

    const stats = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      avgScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0,
    };

    res.json({ test: { _id: test._id, title: test.title, passingPercentage: test.passingPercentage }, stats, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send test link to a specific application/student
// @route   POST /api/tests/:testId/send-link/:applicationId
// @access  Private (Company, Admin)
const sendTestLink = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate('job');
    if (!test) return res.status(404).json({ message: 'Test not found' });

    if (test.job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.testSent = true;
    application.testToken = test.accessToken;
    await application.save();

    res.json({
      message: 'Test link ready to share',
      testLink: `/test/${test.accessToken}`,
      accessToken: test.accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tests created by admin/company
// @route   GET /api/tests/my
// @access  Private (Company, Admin)
const getMyTests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user._id })
      .populate('job', 'title');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTest, getTestByJob, getTestByToken, submitTest, getTestResults, sendTestLink, getMyTests };
