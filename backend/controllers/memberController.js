const Collection = require('../models/Collection');

// --- Ajouter un membre ---
const addMember = async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    const collection = req.collection; // Injectée par checkPermission

    if (collection.members.some(m => m.user.toString() === userId)) {
      return res.status(400).json({ message: 'Membre déjà présent' });
    }

    collection.members.push({ user: userId, permissions });
    await collection.save();

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Mettre à jour les permissions d'un membre ---
const updateMemberPermissions = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { permissions } = req.body;
    const collection = req.collection;

    const member = collection.members.id(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    member.permissions = permissions;
    await collection.save();

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// --- Supprimer un membre ---
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const collection = req.collection;

    const member = collection.members.id(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Membre non trouvé' });
    }

    member.remove();
    await collection.save();

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  addMember,
  updateMemberPermissions,
  removeMember
};
