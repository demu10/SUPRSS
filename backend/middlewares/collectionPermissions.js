// middlewares/collectionPermissions.js
const Collection = require('../models/Collection');

const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      console.log("req.user:", req.user); // utilisateur connecté
      console.log("req.params.id:", req.params.id); // ID de la collection

      const collection = await Collection.findById(req.params.id);
      console.log("collection trouvée:", collection);

      if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });

      const member = collection.members.find(
        m => String(m.user) === String(req.user._id)
      );
      console.log("member trouvé:", member);

      if (!member) {
        return res.status(403).json({ message: 'Vous n\'êtes pas membre de cette collection' });
      }

      // Le créateur a tous les droits
      if (member.permissions.isCreator) {
        req.collection = collection;
        return next();
      }

      // Vérifie la permission demandée
      if (!member.permissions[permission]) {
        return res.status(403).json({ message: 'Permission insuffisante' });
      }

      req.collection = collection;
      next();
    } catch (err) {
      console.error("Erreur middleware permissions:", err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };
};

module.exports = checkPermission;
