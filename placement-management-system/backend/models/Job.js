const mongoose = require('mongoose');

const jobSchema = mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    location: { type: String, required: true },
    salary: { type: String },
    type: { type: String, enum: ['full-time', 'part-time', 'internship'], default: 'full-time' },
    deadline: { type: Date, required: true },
    cgpa: { type: Number },
    skills: { type: String },
    compensationDetails: { type: String },
    material: { type: String },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
