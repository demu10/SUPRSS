// 📁 routes/users.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middlewares/auth');
const sendEmail = require('../utils/sendEmail'); // 🔁 À créer si besoin

// 🔐 Génération de JWT
const generateToken = (user, expiresIn = '365d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas défini dans .env");
  }
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
};

// ✅ INSCRIPTION avec email de confirmation
router.post('/register', async (req, res) => {
  const { nom, prenom, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilisateur déjà inscrit' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ nom, prenom, email, password: hashedPassword, isVerified: false });
    await user.save();

    const token = generateToken(user);
    const confirmUrl = `http://localhost:5000/api/users/confirm/${token}`;
    // const confirmUrl = `${process.env.BASE_URL}/api/users/confirm/${token}`;

    await sendEmail({
      to: email,
      subject: 'Confirme ton inscription',
      html: `<p>Bienvenue ${prenom},</p><p>Merci de t'inscrire. Clique ici pour activer ton compte : <a href="${confirmUrl}">Confirmer</a></p>`
    });

    res.status(200).json({ msg: 'Inscription réussie. Vérifie ton email pour confirmer ton compte.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

// ✅ CONFIRMATION DE COMPTE
router.get('/confirm/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).send('Utilisateur introuvable');

    if (user.isVerified) return res.send('Compte déjà vérifié.');
    user.isVerified = true;
    await user.save();

    res.redirect('http://localhost:3000/?verified=true');
    // res.redirect(`${process.env.CLIENT_URL}/?verified=true`);
  } catch (err) {
    res.status(400).send('Lien invalide ou expiré');
  }
});

// ✅ Connexion classique
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: 'Identifiants invalides' });

    // 🔒 Check si l'utilisateur a un mot de passe
    if (!user.password) {
      return res.status(400).json({
        msg: 'Ce compte a été créé via Google. Veuillez définir un mot de passe via /set-password.',
      });
    }

    if (!user.isVerified)
      return res.status(403).json({ msg: 'Compte non vérifié. Vérifie ton email.' });

    // ✅ Comparaison avec bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: 'Mot de passe incorrect' });

    const token = generateToken(user, '365d');
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});


// ✅ Route pour définir un mot de passe pour utilisateurs Google
router.post('/set-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Utilisateur introuvable." });

    // ⚠️ Si un mot de passe existe déjà, on empêche d’écraser
    if (user.password) {
      return res.status(400).json({ msg: "Ce compte a déjà un mot de passe." });
    }

    // ✅ Hash du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 🔁 Mise à jour du provider
    if (user.provider === 'google' || user.provider === 'github') {
      user.provider = 'both';
    } else {
      user.provider = 'local'; // sécurité par défaut
    }

    await user.save();

    res.status(200).json({
      msg: "Mot de passe défini avec succès. Vous pouvez maintenant vous connecter avec email + mot de passe.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erreur serveur." });
  }
});


module.exports = router;
