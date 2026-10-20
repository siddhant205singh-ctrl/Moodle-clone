const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  author:    { type: String, default: '' },
  category:  { type: String, default: '' },
  isbn:      { type: String, default: '' },
  url:       { type: String, default: '#' },
  thumbnail: { type: String, default: '' }
});

module.exports = mongoose.model('EBook', ebookSchema);
