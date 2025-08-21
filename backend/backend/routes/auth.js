// 📁 routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require("../models/User"); // adapte le chemin si besoin
const router = express.Router();

// 🔒 Durée de validité du token
const TOKEN_EXPIRATION = '365d';

// ✅ Google Login Start
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ✅ Google Callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    console.log("🔥 req.user dans /google/callback =", req.user); // AJOUT ICI  
    console.log("✅ Utilisateur authentifié par Google :", req.user); // 👈 AJOUTE CETTE LIGNE
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    res.redirect(`http://localhost:3000/?token=${token}`);
    // Rediriger vers le frontend pour définir un mot de passe
    // res.redirect(`http://localhost:3000/set-password?email=${user.email}`);

  }
);
// ➕ Route d'échec (à ajouter juste après)
router.get('/google/failure', (req, res) => {
  console.log("❌ ECHEC DE L'AUTHENTIFICATION GOOGLE");
  res.send("Échec de l'authentification via Google.");
});


// ✅ GitHub Login Start
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// ✅ GitHub Callback
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    res.redirect(`http://localhost:3000/?token=${token}`);
    // Rediriger vers le frontend pour définir un mot de passe
    res.redirect(`http://localhost:3000/set-password?email=${user.email}`);

  }
);

// Route de vérification d'email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Token manquant");

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET || "secret123");

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).send("Utilisateur non trouvé");

    if (user.isVerified) {
      return res.send("Ton compte est déjà vérifié !");
    }

    user.isVerified = true;
    await user.save();

    res.send("Ton compte est maintenant vérifié ! Tu peux te connecter.");
  } catch (err) {
    res.status(400).send("Lien invalide ou expiré.");
  }
});



// ✅ Logout (optionnel mais utile)
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000/login');
  });
});

module.exports = router;
