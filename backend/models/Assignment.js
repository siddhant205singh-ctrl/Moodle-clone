const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title:        { type: String, required: true },
    description:  { type: String, default: '' },
    dueDate:      { type: Date },
    maxScore:     { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
