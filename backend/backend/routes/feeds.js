const express = require('express');
const router = express.Router();
const Feed = require('../models/Feed');

router.post('/', async (req, res) => {
  try {
    const feed = await Feed.create(req.body);
    res.status(201).json(feed);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  const feeds = await Feed.find().sort({ createdAt: -1 });
  res.json(feeds);
});

// modify, delete etc.
module.exports = router;
