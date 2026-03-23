const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const questionSchema = mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // exactly 4 options
  correctAnswer: { type: Number, required: true }, // index 0-3
});

const testSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true, default: 30 }, // in minutes
    passingPercentage: { type: Number, default: 60 }, // minimum % to pass
    questions: [questionSchema],
    accessToken: { type: String, default: () => require('crypto').randomUUID(), unique: true },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // whitelist
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
