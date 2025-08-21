// backend/controllers/feedController.js
const Feed = require("../models/Feed");
const Collection = require("../models/Collection");

// --- Créer un flux ---
const createFeed = async (req, res) => {
  try {
    const { name, url, description, categories, updateFrequency, status } = req.body;
    const collectionId = req.params.id;

    if (!name || !url) {
      return res.status(400).json({ message: "Nom et URL sont requis" });
    }

    const feed = new Feed({
      name,
      url,
      description,
      categories: categories || [],
      updateFrequency,
      status
    });

    await feed.save();

    if (collectionId) {
      const collection = await Collection.findById(collectionId);
      if (!collection) return res.status(404).json({ message: "Collection non trouvée" });

      collection.feeds.push(feed._id);
      await collection.save();
    }

    res.status(201).json(feed);
  } catch (error) {
    console.error("Erreur createFeed:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- Récupérer tous les flux ---
const getAllFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find();
    res.json(feeds);
  } catch (error) {
    console.error("Erreur getAllFeeds:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- Récupérer les flux d’une collection ---
const getFeedsByCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate("feeds");
    if (!collection) return res.status(404).json({ message: "Collection non trouvée" });

    res.json(collection.feeds);
  } catch (error) {
    console.error("Erreur getFeedsByCollection:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- Forcer le refresh d’un flux ---
const refreshFeed = async (req, res) => {
  try {
    // Stub: logiquement tu irais chercher les articles du flux
    res.json({ message: `Flux ${req.params.feedId} rafraîchi (stub)` });
  } catch (error) {
    console.error("Erreur refreshFeed:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- Supprimer un flux ---
const deleteFeed = async (req, res) => {
  try {
    const feed = await Feed.findByIdAndDelete(req.params.feedId);
    if (!feed) return res.status(404).json({ message: "Flux non trouvé" });

    await Collection.updateMany(
      { feeds: req.params.feedId },
      { $pull: { feeds: req.params.feedId } }
    );

    res.json({ message: "Flux supprimé" });
  } catch (error) {
    console.error("Erreur deleteFeed:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  createFeed,
  getAllFeeds,
  getFeedsByCollection,
  refreshFeed,
  deleteFeed,
};
