const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Article = require('../models/Article');

// Middleware JWT
const auth = require('../middlewares/auth');

// Toutes les routes Collections sont protégées
router.use(auth);

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

// GET une collection avec ses articles
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const collection = await Collection.findById(id).populate('feeds'); // ou articles si tu stockes les articles
  if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
  res.json(collection);
});

// router.get('/:id/articles', async (req, res) => {
//   try {
//     const articles = await Article.find({ collectionIds: req.params.id });
//     res.json(articles);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Erreur lors de la récupération des articles de la collection' });
//   }
// });

// backend/routes/collections.js

router.get('/:id/articles', auth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate('feeds');
    if (!collection) return res.status(404).json({ msg: 'Collection non trouvée' });

    res.json(collection.feeds); // ou collection.articles selon ton modèle
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});



router.post('/:id/articles', auth, async (req, res) => {
  const { articleId } = req.body;
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ msg: 'Collection non trouvée' });

    // Ajoute l'article à la collection s’il n’y est pas déjà
    if (!collection.feeds.includes(articleId)) {
      collection.feeds.push(articleId);
      await collection.save();
    }

    res.json({ msg: 'Article ajouté à la collection' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// Ajouter un membre à une collection (avec rôle)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (!collection) return res.status(404).json({ error: "Collection non trouvée" });

    // Seul le créateur peut inviter
    const isCreator = collection.members.find(m =>
      m.userId.toString() === req.user._id.toString() && m.role === 'creator'
    );
    if (!isCreator) return res.status(403).json({ error: "Permission refusée" });

    // Ne pas ajouter deux fois le même utilisateur
    const alreadyMember = collection.members.find(m => m.userId.toString() === userId);
    if (alreadyMember) return res.status(400).json({ error: "Utilisateur déjà membre" });

    collection.members.push({ userId, role: role || 'reader' });
    await collection.save();

    res.status(200).json({ message: "Membre ajouté avec succès", collection });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout du membre" });
  }
});

// Retirer un article d'une collection
// Retirer un article d'une collection
router.delete('/:collectionId/articles/:articleId', auth, async (req, res) => {
  try {
    const { collectionId, articleId } = req.params;

    const collection = await Collection.findById(collectionId);
    if (!collection) return res.status(404).json({ error: "Collection non trouvée" });

    // Retire l'article de la collection (dans le champ feeds)
    collection.feeds = collection.feeds.filter(id => id.toString() !== articleId);
    await collection.save();

    // Supprime aussi la référence à la collection dans l'article (si tu veux garder propre)
    await Article.findByIdAndUpdate(articleId, {
      $pull: { collectionIds: collectionId }
    });

    res.json({ message: "Article retiré de la collection" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});




module.exports = router;
