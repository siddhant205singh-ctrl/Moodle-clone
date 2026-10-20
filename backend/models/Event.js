const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  date:        { type: Date,   required: true },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  type:        { type: String, enum: ['assignment', 'quiz', 'lecture', 'exam', 'other'], default: 'other' },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('Event', eventSchema);
