const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middlewares/auth');


const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });
};

router.post('/register', async (req, res) => {
  const { email, password , nom, prenom } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Utilisateur déjà inscrit' });

    user = new User({ email, password, nom, prenom });
    await user.save();

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err); 
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ msg: 'Identifiants invalides' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Mot de passe incorrect' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur serveur' });
  }
});

router.get('/profile', auth, (req, res) => {
  res.json({ msg: `Bienvenue user ${req.user.id}` });
});

module.exports = router;