const express = require('express');
const Feed = require('../models/Feed');
const router = express.Router();

// Récupérer tous les feeds accessibles publiquement
router.get('/', async (req, res) => {
  try {
    const feeds = await Feed.find({ status: 'active' }).lean();
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
