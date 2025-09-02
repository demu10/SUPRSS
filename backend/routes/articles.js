const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const auth = require("../middlewares/auth");

// Récupérer les articles d'une collection
router.get("/collection/:collectionId", auth, async (req, res) => {
  try {
    const articles = await Article.find({
      collectionIds: req.params.collectionId,
    })
      .sort({ publishedAt: -1 }) //publishedAt: date:
      .limit(50);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Nouvelle route pour récupérer les articles d’un flux (feedId)
router.get("/feed/:feedId/articles", auth, async (req, res) => {
  try {
    const articles = await Article.find({ feedId: req.params.feedId }).sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les articles lus/non lus/favoris pour un utilisateur
router.get("/:collectionId/articles", auth, async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { status, favoritesOnly } = req.query;
    const query = { collectionIds: collectionId };

    if (status === "unread") {
      query.readBy = { $ne: req.user.id };
    } else if (status === "read") {
      query.readBy = req.user.id;
    }

    if (favoritesOnly === "true") {
      query.favoritedBy = req.user.id;
    }

    const articles = await Article.find(query).sort({ date: -1 }).limit(100);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', auth, async (req, res) => {
  const { q, category, isFavorite, isRead, feedSource } = req.query;
  const userId = req.user._id;

  let filters = {};

  if (q) {
    filters.$text = { $search: q }; // recherche plein texte
  }

  if (category) {
    filters.tags = category; // si tu as un champ "tags" dans Article
  }

  if (isFavorite === 'true') {
    filters.favoritedBy = userId;
  }

  if (isRead === 'true') {
    filters.readBy = userId;
  } else if (isRead === 'false') {
    filters.readBy = { $ne: userId };
  }

  if (feedSource) {
    filters.sourceName = feedSource;
  }

  try {
    const results = await Article.find(filters).sort({ date: -1 }).limit(50);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});


// ✅ Route PATCH : Marquer comme lu / non lu
router.patch('/:id/read-status', auth, async (req, res) => {
  try {
    const { isRead } = req.body;
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article introuvable' });

    const userId = req.user.id;

    if (isRead) {
      // Marquer comme lu
      if (!article.readBy.includes(userId)) {
        article.readBy.push(userId);
      }
    } else {
      // Marquer comme non lu
      article.readBy = article.readBy.filter(id => id.toString() !== userId);
    }

    await article.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route PATCH : Ajouter ou retirer des favoris
router.patch('/:id/favorite', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Article non trouvé" });

    const userId = req.user.id;

    // S'assure que le tableau existe
    if (!Array.isArray(article.favoritedBy)) {
      article.favoritedBy = [];
    }

    const index = article.favoritedBy.indexOf(userId);

    if (index === -1) {
      article.favoritedBy.push(userId); // ✅ Ajouter aux favoris
    } else {
      article.favoritedBy.splice(index, 1); // ❌ Retirer des favoris
    }

    await article.save();

    res.json({
      message: "Mise à jour du favori réussie",
      favoritedBy: article.favoritedBy
    });

  } catch (err) {
    console.error('❌ Erreur PATCH /favorite:', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 🟢 Route pour récupérer les favoris de l'utilisateur connecté
router.get('/favorites', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Article.find({ favoritedBy: userId }).sort({ date: -1 });
    res.json(favorites);
  } catch (err) {
    console.error('Erreur API GET /favorites', err);
    res.status(500).json({ error: 'Erreur serveur lors du fetch des favoris' });
  }
});
module.exports = router;
