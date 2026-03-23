const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    coverLetter: { type: String },
    tenthMarksheet: { type: String },
    twelfthMarksheet: { type: String },
    collegeMarksheet: { type: String },
    certificates: { type: String },
    updates: [{
      message: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }],
    testSent: { type: Boolean, default: false },
    testToken: { type: String },
    testCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
