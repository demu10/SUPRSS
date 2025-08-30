// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Récupérer le token dans l'en-tête Authorization
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    // Format attendu : "Bearer <token>"
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ message: 'Token invalide ou mal formé' });
    }

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérification de l'utilisateur en base
    const user = await User.findById(decoded.id).select('-password'); 
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Erreur middleware auth:', err.message);
    return res.status(401).json({ message: 'Authentification échouée' });
  }
};
