// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy; // ← switch conseillé
const User = require('../models/User');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Si dispo, on laisse l’ENV prioritaire, sinon on reconstruit.
const GOOGLE_CALLBACK =
  process.env.GOOGLE_CALLBACK_URL || `${BASE_URL}/api/auth/google/callback`;
const GITHUB_CALLBACK =
  process.env.GITHUB_CALLBACK_URL || `${BASE_URL}/api/auth/github/callback`;

console.log('✅ Initialisation des stratégies Passport');
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Chargement de la stratégie Google');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = await User.findOne({ email });

          if (user) {
            if (!user.googleId) user.googleId = profile.id;
            if (!user.provider || user.provider === 'local') user.provider = 'both';
            user.isVerified = true;
            await user.save();
            return done(null, user);
          }

          const newUser = await User.create({
            googleId: profile.id,
            email,
            nom: profile.name?.familyName || '',
            prenom: profile.name?.givenName || '',
            provider: 'google',
            isVerified: true,
          });
          return done(null, newUser);
        } catch (e) {
          return done(e, null);
        }
      }
    )
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('✅ Chargement de la stratégie GitHub');
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
          let user = await User.findOne({ email });

          if (user) {
            if (!user.githubId) user.githubId = profile.id;
            if (!user.provider || user.provider === 'local') user.provider = 'both';
            user.isVerified = true;
            await user.save();
            return done(null, user);
          }

          const newUser = await User.create({
            githubId: profile.id,
            email,
            nom: '',
            prenom: profile.username || '',
            provider: 'github',
            isVerified: true,
          });
          return done(null, newUser);
        } catch (e) {
          return done(e, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});
