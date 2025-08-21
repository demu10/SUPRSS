const Article = require('../models/Article');

// --- Récupérer les articles d'une collection ---
const getArticlesFromCollection = async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  try {
    const collection = req.collection; // Injecté par middleware checkPermission
    const feedsIds = collection.feeds;

    let filter = { feedId: { $in: feedsIds } };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { content: regex },
        { source: regex },
        { keywords: regex }
      ];
    }

    const articles = await Article.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(articles);
  } catch (err) {
    console.error("Erreur getArticlesFromCollection:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Marquer un article comme lu ---
const markRead = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    article.isRead = true;
    await article.save();

    res.json(article);
  } catch (err) {
    console.error("Erreur markRead:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Toggle favori ---
const toggleFavorite = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    article.isFavorite = !article.isFavorite;
    await article.save();

    res.json(article);
  } catch (err) {
    console.error("Erreur toggleFavorite:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getArticlesFromCollection,
  markRead,
  toggleFavorite
};
