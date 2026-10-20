const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String, required: true },
    role:          { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
    name:          { type: String, required: true },
    department:    { type: String, default: '' },
    studentId:     { type: String, default: '' },
    avatar:        { type: String, default: '' },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
