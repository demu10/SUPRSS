// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

    req.user = user; // <- Obligatoire pour collectionController
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Authentification échouée' });
  }
};
