const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// PATCH /api/articles/:id/read  -> Marquer comme lu / non lu
router.patch('/:id/read', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { isRead: !!req.body.isRead },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/articles/:id/favorite  -> Ajouter aux favoris / Retirer des favoris
router.patch('/:id/favorite', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { isFavorite: !!req.body.isFavorite },
      { new: true }
    );
    if (!article) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/collection/:collectionId  -> Récupérer les articles d'une collection spécifique
router.get('/collection/:collectionId', async (req, res) => {
  try {
    const articles = await Article.find({ collectionId: req.params.collectionId }).sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/feed/:feedId  -> Récupérer les articles d'un flux spécifique
router.get('/feed/:feedId', async (req, res) => {
  try {
    const articles = await Article.find({ feedId: req.params.feedId }).sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
