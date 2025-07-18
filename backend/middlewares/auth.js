const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ msg: 'Pas de token, accès refusé' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Token manquant, accès refusé' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide, accès refusé' });
  }
};

module.exports = auth;
