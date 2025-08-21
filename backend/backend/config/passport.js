const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} = process.env;

console.log("✅ Initialisation des stratégies Passport");

// ✅ GOOGLE STRATEGY
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  console.log("✅ Chargement de la stratégie Google");

  passport.use(new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        let user = await User.findOne({ email });

        if (user) {
          // ✅ Mise à jour du compte existant
          if (!user.googleId) user.googleId = profile.id;
          if (!user.provider || user.provider === 'local') user.provider = 'both';
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // ✅ Création d’un nouveau compte Google
        const newUser = await User.create({
          googleId: profile.id,
          email,
          nom: profile.name?.familyName || '',
          prenom: profile.name?.givenName || '',
          provider: 'google',
          isVerified: true
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}

// ✅ GITHUB STRATEGY
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  console.log("✅ Chargement de la stratégie GitHub");

  passport.use(new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;

        let user = await User.findOne({ email });

        if (user) {
          // ✅ Mise à jour du compte existant
          if (!user.githubId) user.githubId = profile.id;
          if (!user.provider || user.provider === 'local') user.provider = 'both';
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // ✅ Création d’un nouveau compte GitHub
        const newUser = await User.create({
          githubId: profile.id,
          email,
          nom: '',
          prenom: profile.username || '',
          provider: 'github',
          isVerified: true
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  ));
}

// ✅ Serialisation/Désérialisation
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
});
