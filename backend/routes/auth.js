// backend/routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const TOKEN_EXPIRATION = '365d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session:false, failureRedirect: `${CLIENT_URL}/login` }),
  (req,res)=>{
    if (!req.user) return res.redirect(`${CLIENT_URL}/login?error=google`);
    const token = jwt.sign({ id:req.user._id }, JWT_SECRET, { expiresIn:TOKEN_EXPIRATION });
    return res.redirect(`${CLIENT_URL}/?token=${token}`);
  }
);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session:false, failureRedirect: `${CLIENT_URL}/login` }),
  (req,res)=>{
    if (!req.user) return res.redirect(`${CLIENT_URL}/login?error=github`);
    const token = jwt.sign({ id:req.user._id }, JWT_SECRET, { expiresIn:TOKEN_EXPIRATION });
    return res.redirect(`${CLIENT_URL}/?token=${token}`);
  }
);

module.exports = router;
