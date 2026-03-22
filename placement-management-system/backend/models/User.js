const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'company', 'admin'],
      default: 'student',
    },
    // Student specific fields
    major: { type: String },
    graduationYear: { type: Number },
    resumeUrl: { type: String },
    skills: [{ type: String }],
    
    // Company specific fields
    companyName: { type: String },
    companyDescription: { type: String },
    website: { type: String },
    
    // Approval
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
