const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type:         { type: String, enum: ['forum', 'page', 'file', 'url', 'assign', 'quiz', 'video'], default: 'file' },
  name:         { type: String, required: true },
  href:         { type: String, default: '#' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', default: null },
}, { _id: false });

const topicSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  activities: [activitySchema]
}, { _id: false });

const courseSchema = new mongoose.Schema(
  {
    slug:       { type: String, required: true, unique: true },
    code:       { type: String, required: true },
    title:      { type: String, required: true },
    category:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    instructor: { type: String, default: '' },
    description:{ type: String, default: '' },
    thumbnail:  { type: String, default: '' },
    color:      { type: String, default: '#1e4f8a' },
    topics:     [topicSchema],
    enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

// Text index for search
courseSchema.index({ title: 'text', description: 'text', code: 'text' });

module.exports = mongoose.model('Course', courseSchema);
