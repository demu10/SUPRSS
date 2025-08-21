// routes/articles.js
const express = require("express");
const router = express.Router();
const Parser = require("rss-parser");
const parser = new Parser();

const Article = require("../models/Article");
const Feed = require("../models/Feed");
const Collection = require("../models/Collection");


// --------------------
// 1. BANDE DÉFILÉE (Accueil)
// --------------------
const rssFeeds = [
  "https://www.lemonde.fr/rss/une.xml",
  "https://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "https://feeds.feedburner.com/TechCrunch/"
];

router.get("/accueil", async (req, res) => {
  try {
    const articles = [];

    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(feedUrl);
      feed.items.forEach(item => {
        articles.push({
          title: item.title,
          link: item.link,
          date: item.pubDate,
          author: item.creator || item.author || "Inconnu",
          snippet: item.contentSnippet || "",
          sourceName: feed.title || new URL(feedUrl).hostname,
          rssLink: feed.link || feedUrl
        });
      });
    }

    // Trier les articles du plus récent au plus ancien
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(articles.slice(0, 30)); // Limite à 30 articles pour la bande défilée
  } catch (err) {
    console.error("Erreur RSS :", err);
    res.status(500).json({ error: "Impossible de charger les articles d'accueil." });
  }
});


// --------------------
// 2. ARTICLES D’UNE COLLECTION (stockés en DB)
// --------------------
router.get("/collection/:collectionId", async (req, res) => {
  const { collectionId } = req.params;
  const { search } = req.query;

  try {
    // Vérifier que la collection existe
    const collection = await Collection.findById(collectionId).populate("feeds");
    if (!collection) return res.status(404).json({ error: "Collection introuvable." });

    // On récupère les IDs de flux liés à cette collection
    const feedsIds = collection.feeds.map(f => f._id);

    // Construire le filtre
    const filter = { feedId: { $in: feedsIds } };
    if (search) {
      filter.$text = { $search: search }; // index texte (title, snippet, content, sourceName)
    }

    const articles = await Article.find(filter).sort({ date: -1 }).limit(500);
    res.json(articles);
  } catch (err) {
    console.error("Erreur get collection articles :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des articles." });
  }
});


// --------------------
// 3. SYNCHRONISER ET SAUVEGARDER LES ARTICLES D’UN FLUX
// --------------------
router.post("/sync/:feedId", async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.feedId);
    if (!feed) return res.status(404).json({ error: "Flux introuvable." });

    const parsedFeed = await parser.parseURL(feed.url);

    const newArticles = [];
    for (const item of parsedFeed.items) {
      try {
        const article = await Article.findOneAndUpdate(
          { link: item.link }, // éviter les doublons
          {
            feedId: feed._id,
            collectionIds: [feed.collection], // lien avec la collection
            title: item.title,
            link: item.link,
            date: item.pubDate || new Date(),
            author: item.creator || item.author || "Inconnu",
            snippet: item.contentSnippet || "",
            content: item.content || "",
            sourceName: parsedFeed.title || new URL(feed.url).hostname,
            feedUrl: feed.url
          },
          { upsert: true, new: true }
        );
        newArticles.push(article);
      } catch (e) {
        console.warn("Article déjà existant :", item.link);
      }
    }

    res.json({ message: "Synchronisation terminée", newArticles });
  } catch (err) {
    console.error("Erreur sync feed :", err);
    res.status(500).json({ error: "Erreur lors de la synchronisation du flux." });
  }
});


// --------------------
// 4. MARQUER UN ARTICLE COMME LU / FAVORI
// --------------------
router.post("/:articleId/read", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.articleId,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Impossible de marquer l'article comme lu." });
  }
});

router.post("/:articleId/favorite", async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.articleId,
      { $addToSet: { favoritedBy: req.user._id } },
      { new: true }
    );
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: "Impossible de favoriser l'article." });
  }
});

module.exports = router;
