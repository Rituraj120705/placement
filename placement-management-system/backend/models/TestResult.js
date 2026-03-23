const mongoose = require('mongoose');

const answerSchema = mongoose.Schema({
  questionIndex: { type: Number },
  selectedOption: { type: Number }, // index 0-3, null if unanswered
});

const testResultSchema = mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent a student from submitting the same test twice
testResultSchema.index({ test: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('TestResult', testResultSchema);
