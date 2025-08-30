// backend/server.js
require('dotenv').config();
require('./config/passport');

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');

// ⚠️ importe le middleware AVANT de l'utiliser
const auth = require('./middlewares/auth');

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  saveUninitialized: true,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

// -------------------
// Routes publiques
// -------------------
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// ✅ Bannière HomePage (publique, pas de token)
app.use('/api/articles', require('./routes/articlesPublic'));

// ✅ (option) Feeds publics si tu en as un fichier dédié
// app.use('/api/feeds/public', require('./routes/feedsPublic'));

// -------------------
// Routes protégées
// -------------------

// ⚠️ On met les articles DB sur un préfixe différent pour éviter le conflit
//    avec la bannière publique ci-dessus.
app.use('/api/articles-db', auth, require('./routes/articles'));

app.use('/api/collections', auth, require('./routes/collections'));

// Si ton fichier routes/feeds mélange public + protégé en interne,
// garde-le tel quel. Sinon, protège ici :
app.use('/api/feeds', auth, require('./routes/feeds'));

// -------------------
// Validation token (protégé)
// -------------------
app.get('/api/users/validate-token', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// -------------------
// Gestion erreurs
// -------------------
app.use((req, res, next) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
