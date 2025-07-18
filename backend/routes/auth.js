const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // au lieu de bcrypt
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: 'http://localhost:3000/login'
}), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '365d' });
  res.redirect(`http://localhost:3000?token=${token}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', {
  session: false,
  failureRedirect: 'http://localhost:3000/login'
}), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.redirect(`http://localhost:3000?token=${token}`);
});

module.exports = router;