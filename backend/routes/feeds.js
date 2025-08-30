// backend/routes/feeds.js
const express = require('express');
const router = express.Router();
const Feed = require('../models/Feed');
const Parser = require('rss-parser');
const auth = require('../middlewares/auth');

// ============ PUBLIC ============

// Tous les feeds visibles publiquement (pour affichage)
router.get('/public', async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    return res.json(Array.isArray(feeds) ? feeds : []);
  } catch (err) {
    console.error('Erreur /api/feeds/public :', err);
    return res.json([]);
  }
});

// Articles d’un feed (live RSS, timeout + fallback)
router.get('/:feedId/articles', async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.feedId);
    if (!feed) return res.status(404).json({ error: 'Flux non trouvé' });

    const parser = new Parser({ requestOptions: { timeout: 8000 } });
    try {
      const data = await parser.parseURL(feed.url);
      const items = (data.items || []).map(item => ({
        title: item.title,
        link: item.link,
        summary: item.contentSnippet || item.content || '',
        pubDate: item.pubDate || item.isoDate,
        sourceName: data.title || feed.url,
      }));
      return res.json(items);
    } catch (e) {
      console.error('RSS KO pour', feed.url, e?.code || e?.message);
      return res.json([]); // pas de 500
    }
  } catch (err) {
    console.error('Erreur /api/feeds/:feedId/articles :', err);
    return res.json([]); // pas de 500
  }
});

// Liste complète (lecture) – si tu veux la laisser publique :
router.get('/', async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 });
    return res.json(Array.isArray(feeds) ? feeds : []);
  } catch (err) {
    console.error('Erreur /api/feeds :', err);
    return res.json([]);
  }
});

// Feeds par collection (public si tu veux)
router.get('/collection/:collectionId', async (req, res) => {
  try {
    const feeds = await Feed.find({ collectionId: req.params.collectionId });
    return res.json(Array.isArray(feeds) ? feeds : []);
  } catch (err) {
    console.error('Erreur /api/feeds/collection/:collectionId :', err);
    return res.json([]);
  }
});

// ============ PROTÉGÉ ============

// Créer un feed (protégé)
router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body;
    const feed = await Feed.create({
      title: payload.title,
      url: payload.url,
      description: payload.description,
      categories: payload.categories || [],
      updateFrequency: payload.updateFrequency || 'daily',
      status: payload.status || 'active',
      collectionId: payload.collectionId || null,
      membersCanEdit: [req.user.id],
    });
    return res.status(201).json(feed);
  } catch (err) {
    console.error('Erreur POST /api/feeds :', err);
    return res.status(400).json({ error: 'Impossible de créer le flux' });
  }
});

// Supprimer un feed (protégé)
router.delete('/:id', auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: 'Feed non trouvé' });

    await feed.deleteOne();
    return res.json({ message: 'Feed supprimé' });
  } catch (err) {
    console.error('Erreur DELETE /api/feeds/:id :', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
