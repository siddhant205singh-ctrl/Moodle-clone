const router = require('express').Router();
const EBook  = require('../models/EBook');

// GET /api/ebooks
router.get('/', async (_req, res) => {
  const books = await EBook.find({}).lean();
  res.json(books);
});

module.exports = router;
