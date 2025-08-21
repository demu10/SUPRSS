const Collection = require('../models/Collection');

// --- Créer une collection ---
const createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // récupère l’utilisateur connecté

    // Création collection
    const collection = await Collection.create({
      name,
      description,
      creator: userId,
      members: [{
        user: userId,
        permissions: {
          isCreator: true,
          canAddFeed: true,
          canRead: true,
          canComment: true,
          isAdmin: true
        }
      }]
    });

    // Bien renvoyer la collection créée (sans populate compliqué)
    const saved = await Collection.findById(collection._id)
      .populate("creator", "email")
      .populate("members.user", "email");

    res.status(201).json(saved);

  } catch (err) {
    console.error("Erreur création collection:", err);
    res.status(500).json({ message: "Erreur serveur lors de la création" });
  }
};

// --- Récupérer toutes les collections ---
const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find()
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .populate('feeds');

    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Supprimer une collection ---
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'ID collection invalide' });
    }

    const collection = await Collection.findById(id);

    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

    const member = collection.members.find(
      m => m.user && String(m.user._id) === String(req.user._id)
    );

    if (!member || !member.permissions.isAdmin) {
      return res.status(403).json({ message: 'Permission refusée pour la suppression' });
    }

    await collection.deleteOne();

    // Retour immédiat côté front
    return res.json({ message: 'Collection supprimée', deletedId: id });
  } catch (err) {
    console.error('Erreur suppression collection:', err.stack || err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


// --- Récupérer une collection par ID ---
const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email')
      .populate('feeds');

    if (!collection) {
      return res.status(404).json({ message: 'Collection non trouvée' });
    }

    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// --- Mettre à jour une collection ---
const updateCollection = async (req, res) => {
  const { name, description, isShared } = req.body;

  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection non trouvée' });
    }

    // Vérifier si l’utilisateur est bien le créateur
    const member = collection.members.find(
      m => m.user && String(m.user._id) === String(req.user._id)
    );

    if (!member || !member.permissions.isCreator) {
      return res.status(403).json({ message: 'Permission refusée pour la mise à jour' });
    }

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isShared !== undefined) collection.isShared = isShared;

    await collection.save();
    await collection.populate('creator', 'name email').populate('members.user', 'name email');

    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// --- Ajouter un membre ---
const addMember = async (req, res) => {
  const { collectionId, userId, permissions } = req.body;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

    const requestingMember = collection.members.find(
      m => m.user && String(m.user._id) === String(req.user._id)
    );

    if (!requestingMember || !requestingMember.permissions.isAdmin) {
      return res.status(403).json({ message: 'Permission refusée' });
    }

    if (collection.members.some(m => String(m.user) === userId)) {
      return res.status(400).json({ message: 'Utilisateur déjà membre' });
    }

    collection.members.push({
      user: userId,
      permissions: {
        isCreator: permissions?.isCreator || false,
        canAddFeed: permissions?.canAddFeed || false,
        canRead: permissions?.canRead || true,
        canComment: permissions?.canComment || false,
        isAdmin: permissions?.isAdmin || false,
      },
    });

    await collection.save();
    await collection.populate('members.user', 'name email');
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// --- Retirer un membre ---
const removeMember = async (req, res) => {
  const { collectionId, userId } = req.body;

  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

    const requestingMember = collection.members.find(
      m => m.user && String(m.user._id) === String(req.user._id)
    );

    if (!requestingMember || !requestingMember.permissions.isAdmin) {
      return res.status(403).json({ message: 'Permission refusée' });
    }

    // Vérifier si le membre existe
    if (!collection.members.some(m => String(m.user) === userId)) {
      return res.status(404).json({ message: 'Membre non trouvé dans la collection' });
    }

    collection.members = collection.members.filter(
      m => String(m.user) !== userId
    );

    await collection.save();
    await collection.populate('members.user', 'name email');
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

module.exports = {
  createCollection,
  getAllCollections,
  getCollectionById,  // ← celui-ci doit bien exister
  updateCollection,
  deleteCollection,
  addMember,
  removeMember,
};