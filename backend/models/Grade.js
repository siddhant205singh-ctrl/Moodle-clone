const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score:    { type: Number, min: 0, max: 100 },
    grade:    { type: String, enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'NA'], default: 'NA' },
    semester: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);
