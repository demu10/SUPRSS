const Article = require('../models/Article');

// --- Récupérer les articles d'une collection ---
const getArticlesFromCollection = async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const userId = req.user?.id; // ou req.user._id selon ton middleware d'auth

  try {
    const collection = req.collection; // Injecté par un middleware
    const feedsIds = collection.feeds;

    let filter = { feedId: { $in: feedsIds } };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { content: regex },
        { sourceName: regex },
        { keywords: regex }
      ];
    }

    const articles = await Article.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Injecter isFavorite pour chaque article
    const updatedArticles = articles.map(article => ({
      ...article,
      isFavorite: article.favoritedBy?.some(id => id.toString() === userId),
    }));

    res.json(updatedArticles);
  } catch (err) {
    console.error("Erreur getArticlesFromCollection:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// --- Récupérer les articles d’un flux RSS ---
const getArticlesFromFeed = async (req, res) => {
  const { feedId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user.id;

  try {
    const articles = await Article.find({ feedId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(); // ➕ lean()

    const enriched = articles.map(article => ({
      ...article,
      isFavorite: article.favoritedBy?.some(id => id.toString() === userId),
      isRead: article.readBy?.some(id => id.toString() === userId),
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Erreur getArticlesFromFeed:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Marquer un article comme lu (par utilisateur) ---
const markRead = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    const userId = req.user.id;

    if (!article.readBy.includes(userId)) {
      article.readBy.push(userId);
      await article.save();
    }

    res.json({ message: 'Marqué comme lu', article });
  } catch (err) {
    console.error("Erreur markRead:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Toggle favori (ajouter/retirer) ---
const toggleFavorite = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    const userId = req.user.id;

    if (article.favoritedBy.includes(userId)) {
      article.favoritedBy = article.favoritedBy.filter(id => id.toString() !== userId);
    } else {
      article.favoritedBy.push(userId);
    }

    await article.save();
    res.json({ message: 'Favori mis à jour', article });
  } catch (err) {
    console.error("Erreur toggleFavorite:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Récupérer tous les articles favoris de l'utilisateur ---
const getFavoriteArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    const articles = await Article.find({ favoritedBy: userId })
      .sort({ date: -1 })
      .lean(); // ➕ lean()

    const enriched = articles.map(article => ({
      ...article,
      isFavorite: true,
      isRead: article.readBy?.some(id => id.toString() === userId),
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Erreur getFavoriteArticles:", err);
    res.status(500).json({ message: 'Erreur lors de la récupération des favoris' });
  }
};

module.exports = {
  getArticlesFromCollection,
  getArticlesFromFeed,
  markRead,
  toggleFavorite,
  getFavoriteArticles
};
