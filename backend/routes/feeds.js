const express = require('express');
const router = express.Router();
const Feed = require('../models/Feed');
const Collection = require('../models/Collection');

// --- Créer un flux (optionnellement lié à une collection) ---
router.post('/', async (req, res) => {
  try {
    const { name, url, description, categories, updateFrequency, status, collectionId, addedBy } = req.body;

    const feed = new Feed({
      name,
      url,
      description,
      categories,
      updateFrequency,
      status,
      addedBy,
      collection: collectionId || null
    });

    await feed.save();

    // Si collectionId fourni, ajouter le feed à la collection
    if (collectionId) {
      const collection = await Collection.findById(collectionId);
      if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

      collection.feeds.push(feed._id);
      await collection.save();
    }

    res.status(201).json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Récupérer tous les flux ---
router.get('/', async (req, res) => {
  try {
    const feeds = await Feed.find().sort({ createdAt: -1 }).populate('collection', 'name');
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Récupérer un flux par ID ---
router.get('/:id', async (req, res) => {
  try {
    const feed = await Feed.findById(req.params.id).populate('collection', 'name');
    if (!feed) return res.status(404).json({ message: 'Flux non trouvé' });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Modifier un flux ---
router.put('/:id', async (req, res) => {
  try {
    const feed = await Feed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!feed) return res.status(404).json({ message: 'Flux non trouvé' });
    res.json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Supprimer un flux ---
router.delete('/:id', async (req, res) => {
  try {
    const feed = await Feed.findByIdAndDelete(req.params.id);
    if (!feed) return res.status(404).json({ message: 'Flux non trouvé' });

    // Retirer le feed de sa collection si lié
    if (feed.collection) {
      const collection = await Collection.findById(feed.collection);
      if (collection) {
        collection.feeds = collection.feeds.filter(f => f.toString() !== feed._id.toString());
        await collection.save();
      }
    }

    res.json({ message: 'Flux supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
