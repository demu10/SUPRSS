// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Génère un JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "365d" }
  );
};

// ==================== REGISTER (classique email/password) ====================
const register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: 'Utilisateur déjà inscrit' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nom, prenom, email, password: hashedPassword });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};

// ==================== LOGIN (classique email/password) ====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Email ou mot de passe invalide' });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ msg: 'Email ou mot de passe invalide' });

    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};

// ==================== LOGIN VIA OAUTH (Google/GitHub) ====================
// Appelé par Passport après OAuth
const oauthCallback = async (req, res) => {
  try {
    const user = req.user; // Passport injecte req.user après succès
    if (!user) return res.status(400).json({ msg: "Utilisateur OAuth introuvable" });

    const token = generateToken(user);

    // ⚠️ redirection vers frontend avec token (par ex. React)
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Erreur serveur OAuth" });
  }
};

module.exports = { register, login, oauthCallback };
