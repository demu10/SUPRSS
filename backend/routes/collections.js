const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// Middleware JWT
const authenticateJWT = require('../middlewares/auth');

// Toutes les routes Collections sont protégées
router.use(authenticateJWT);

// Récupérer toutes les collections de l’utilisateur connecté
router.get('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const collections = await Collection.find({ 'members.userId': req.user._id });
    res.json(Array.isArray(collections) ? collections : []); // ⚡ Toujours renvoyer un tableau
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible de récupérer les collections' });
  }
});

// Créer une nouvelle collection
router.post('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    const collection = new Collection({
      name: req.body.name,
      ownerId: req.user._id,
      members: [{ userId: req.user._id, role: 'creator' }]
    });
    await collection.save();
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible de créer la collection' });
  }
});

module.exports = router;
