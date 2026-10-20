const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  courseCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
