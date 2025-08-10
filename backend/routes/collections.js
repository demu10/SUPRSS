const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// Create collection
router.post('/', async (req, res) => {
  try {
    const { name, isShared } = req.body;
    const collection = await Collection.create({
      name,
      isShared,
      ownerId: req.user._id,
      members: [{ userId: req.user._id, permissions: { read: true, comment: true, addFeeds: true } }]
    });
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all articles in collection with search
router.get('/:id/articles', async (req, res) => {
  const { search } = req.query;
  const { id } = req.params;
  let query = { collectionId: id };

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { title: regex },
      { url: regex },
      { contentSnippet: regex },
      { keywords: regex }
    ];
  }

  try {
    const Article = require('../models/Article');
    const articles = await Article.find(query);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
