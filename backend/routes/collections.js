const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const checkPermission = require('../middlewares/collectionPermissions');

const collectionController = require('../controllers/collectionController');
const feedController = require('../controllers/feedController');
const articleController = require('../controllers/articleController');

// ========================
// ROUTES COLLECTIONS CRUD
// ========================

// Créer une collection
router.post('/', auth, collectionController.createCollection);

// Récupérer toutes les collections
router.get('/', auth, collectionController.getAllCollections);

// Récupérer une collection par ID (lecture uniquement si permission canRead)
router.get('/:id', auth, checkPermission('canRead'), collectionController.getCollectionById);

// Mettre à jour une collection (seul le créateur ou admin peut modifier)
router.put('/:id', auth, checkPermission('isAdmin'), collectionController.updateCollection);

// Supprimer une collection (seul le créateur ou admin peut supprimer)
router.delete('/:id', auth, checkPermission('isAdmin'), collectionController.deleteCollection);

// ========================
// ROUTES MEMBRES
// ========================

// Ajouter un membre
router.post('/add-member', auth, collectionController.addMember);

// Retirer un membre
router.post('/remove-member', auth, collectionController.removeMember);

// ========================
// ROUTES FEEDS
// ========================

// Ajouter un feed à une collection
router.post('/:id/feeds', auth, checkPermission('canAddFeed'), feedController.createFeed);
router.get('/:id/feeds', auth, checkPermission('canRead'), feedController.getFeedsByCollection);
router.post('/feeds/:feedId/refresh', auth, feedController.refreshFeed);
router.delete('/feeds/:feedId', auth, feedController.deleteFeed);


// TODO: Ajouter routes update/delete feed avec checkPermission si besoin

// ========================
// ROUTES ARTICLES
// ========================

// Récupérer les articles d’une collection
router.get('/:id/articles', auth, checkPermission('canRead'), articleController.getArticlesFromCollection);
router.patch('/articles/:articleId/read', auth, articleController.markRead);
router.patch('/articles/:articleId/favorite', auth, articleController.toggleFavorite);


// ========================
// DEBUG IMPORTS
// ========================

console.log({
    createCollection: typeof collectionController.createCollection,
    getAllCollections: typeof collectionController.getAllCollections,
    getCollectionById: typeof collectionController.getCollectionById,
    updateCollection: typeof collectionController.updateCollection,
    deleteCollection: typeof collectionController.deleteCollection,
    addMember: typeof collectionController.addMember,
    removeMember: typeof collectionController.removeMember,
    createFeed: typeof feedController.createFeed,
    getArticlesFromCollection: typeof articleController.getArticlesFromCollection
});

module.exports = router;
