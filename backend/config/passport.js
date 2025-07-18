const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/User');

const { GOOGLE_ID, GOOGLE_SECRET, GITHUB_ID, GITHUB_SECRET } = process.env;

if (GOOGLE_ID && GOOGLE_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_ID,
    clientSecret: GOOGLE_SECRET,
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          provider: 'google'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

if (GITHUB_ID && GITHUB_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: GITHUB_ID,
    clientSecret: GITHUB_SECRET,
    callbackURL: '/api/auth/github/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          name: profile.username,
          email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
          provider: 'github'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));