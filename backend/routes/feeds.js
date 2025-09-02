// backend/routes/feeds.js
const express = require('express');
const router = express.Router();
const Feed = require('../models/Feed');
const Parser = require('rss-parser');
const parser = new Parser();
const Article = require('../models/Article');
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
    const {
      name,
      url,
      description,
      categories,
      updateFrequency,
      status,
      collectionId
    } = req.body;

    // Validation minimale
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({ error: "L'URL du flux est requise." });
    }

    // Tenter de parser le titre depuis le flux RSS si le nom est manquant
    let finalName = name?.trim();
    if (!finalName) {
      try {
        const parsed = await parser.parseURL(url.trim());
        finalName = parsed.title || "Flux sans titre";
      } catch (e) {
        return res.status(400).json({
          error: "Impossible de récupérer ou parser le flux RSS fourni. Vérifiez l'URL.",
          details: e.message
        });
      }
    }

    const feed = await Feed.create({
      name: finalName,
      url: url.trim(),
      description: description?.trim() || '',
      categories: categories || [],
      updateFrequency: updateFrequency || 'daily',
      status: status || 'active',
      collectionId: collectionId || null,
      membersCanEdit: [req.user.id],
    });

    return res.status(201).json(feed);
  } catch (err) {
    console.error('Erreur POST /api/feeds :', err);
    return res.status(400).json({
      error: 'Impossible de créer le flux',
      details: err.message || err
    });
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

// Endpoint pour rafraîchir un flux et enregistrer les articles
router.post('/:id/refresh', auth, async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id);
    if (!feed) return res.status(404).json({ message: 'Flux introuvable' });

    const parsed = await parser.parseURL(feed.url);
    let added = 0;

    for (const item of parsed.items) {
      const link = item.link;
      if (!link) continue;

      const exists = await Article.findOne({ link });
      if (exists) continue;

      const article = new Article({
        feedId: feed._id,
        collectionIds: [feed.collectionId],
        title: item.title || '',  // title
        link,
        date: item.pubDate ? new Date(item.pubDate) : new Date(),
        author: item.creator || item.author || '',
        snippet: item.contentSnippet || '',
        content: item.content || item.contentSnippet || '',
        sourceName: parsed.title || feed.title || '',
        feedUrl: parsed.link || feed.url,
        readBy: [],              // 👈 à ajouter
        favoritedBy: [], 
      });

      await article.save();
      added++;
    }

    res.status(200).json({ message: `✅ ${added} article(s) ajouté(s)` });
  } catch (error) {
    console.error('Erreur de parsing RSS:', error);
    res.status(500).json({ message: 'Erreur lors du rafraîchissement du flux' });
  }
});

router.get('/feed/:feedId/articles', auth, async (req, res) => {
  try {
    const articles = await Article.find({ feedId: req.params.feedId }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des articles.' });
  }
});


module.exports = router;
