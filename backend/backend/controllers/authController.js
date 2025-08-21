// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: 'Utilisateur déjà inscrit' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nom, prenom, email, password: hashedPassword });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '365d' // Longue durée
    });

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Email ou mot de passe invalide' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Email ou mot de passe invalide' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '365d'
    });

    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Erreur serveur' });
  }
};

module.exports = { register, login };
