const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const authMiddleware = require('../middlewares/auth');

// Créer collection
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, isShared, members } = req.body;
  try {
    const collection = new Collection({
      name,
      description,
      isShared,
      creator: req.user._id,
      members: members ? members.map(m => ({
        user: m.userId,
        permissions: m.permissions
      })) : [],
      feeds: []
    });
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find();  // récupère toutes les collections
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Ajouter un membre (avec permissions)
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

    // Vérifier que req.user a les droits d'admin sur cette collection

    collection.members.push({
      user: req.body.userId,
      permissions: req.body.permissions
    });
    await collection.save();
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les articles de la collection avec filtre (recherche)
router.get('/:id/articles', authMiddleware, async (req, res) => {
  const { search } = req.query;
  try {
    const collection = await Collection.findById(req.params.id).populate('feeds');
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

    // vérifier permissions lecture pour req.user

    // récupérer les articles des flux de la collection
    const feedsIds = collection.feeds.map(f => f._id);

    // Construire un filtre recherche (titre, source, mots clés, contenu)
    const Article = require('../models/Article');
    const filter = { feed: { $in: feedsIds } };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
        // Ajouter source, mots-clés si tu les stockes
      ];
    }

    const articles = await Article.find(filter).sort({ publicationDate: -1 });
    res.json(articles);

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
