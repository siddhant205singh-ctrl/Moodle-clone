const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  mimeType:     { type: String, default: 'application/octet-stream' },
  size:         { type: Number, default: 0 },       // bytes
  data:         { type: String, required: true },   // base64-encoded file content
}, { _id: false });

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
    files:      [fileSchema],
    comments:   { type: String, default: '' },
    grade:      { type: Number, default: null },    // null = not graded yet
    gradedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    gradedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

// One submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
