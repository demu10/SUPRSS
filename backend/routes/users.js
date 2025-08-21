// routes/users.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// 🔑 Générer un token JWT
const generateToken = (user, expiresIn = '365d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas défini dans .env");
  }
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn });
};

// ============================
// ✅ INSCRIPTION AVEC CONFIRMATION EMAIL
// ============================
router.post('/register', async (req, res) => {
  const { nom, prenom, email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email et mot de passe requis.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Utilisateur déjà inscrit.' });

    const user = new User({ nom, prenom, email, password, isVerified: false });
    await user.save();

    const token = generateToken(user, '365d'); // lien valable '1h'
    const confirmUrl = `${process.env.CLIENT_URL}/confirm/${token}`;
    console.log("Lien de confirmation :", confirmUrl);

    await sendEmail({
      to: email,
      subject: 'Confirme ton inscription',
      html: `<p>Bienvenue ${prenom || ''},</p>
             <p>Merci de t'inscrire. Clique ici pour activer ton compte : 
             <a href="${confirmUrl}">Confirmer</a></p>`
    });

    res.status(200).json({ msg: 'Inscription réussie. Vérifie ton email pour confirmer ton compte.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// ============================
// ✅ CONFIRMATION DE COMPTE
// ============================
router.get('/confirm/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('Utilisateur introuvable.');

    if (user.isVerified) return res.send('Compte déjà vérifié.');
    user.isVerified = true;
    await user.save();

    // Redirige vers frontend avec paramètre verified
    res.redirect(`${process.env.CLIENT_URL}/?verified=true`);
  } catch (err) {
    console.error(err);
    res.status(400).send('Lien invalide ou expiré.');
  }
});

// ============================
// ✅ CONNEXION
// ============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ msg: 'Identifiants invalides.' });

    if (!user.password) {
      return res.status(400).json({ msg: 'Ce compte a été créé via un fournisseur externe. Utilise /set-password.' });
    }
    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Compte non vérifié. Vérifie ton email.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Mot de passe incorrect.' });

    const token = generateToken(user, '365d');
    const { password: _, ...userData } = user.toObject();
    res.status(200).json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// ============================
// ✅ DÉFINIR UN MOT DE PASSE POUR COMPTES OAUTH
// ============================
router.post('/set-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ msg: 'Utilisateur introuvable.' });

    if (user.password) return res.status(400).json({ msg: 'Ce compte a déjà un mot de passe.' });

    user.password = password; // le hash se fera automatiquement dans le modèle
    if (['google', 'github'].includes(user.provider)) {
      user.provider = 'both';
    } else {
      user.provider = 'local';
    }

    await user.save();
    res.status(200).json({ msg: 'Mot de passe défini avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur.' });
  }
});

// ============================
// ✅ VALIDATION DU TOKEN
// ============================
router.get('/validate-token', async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ valid: false, msg: 'Header Authorization manquant' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ valid: false, msg: 'Token manquant dans Authorization' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ valid: false, msg: 'Utilisateur introuvable pour ce token' });
    }

    res.status(200).json({ valid: true, msg: 'Token valide', user: { id: user._id, email: user.email } });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, msg: 'Token expiré' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ valid: false, msg: 'Token invalide' });
    } else {
      console.error(err);
      return res.status(500).json({ valid: false, msg: 'Erreur serveur lors de la validation du token' });
    }
  }
});


module.exports = router;
