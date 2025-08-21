require('dotenv').config();
require('./config/passport');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');

// IMPORTANT : charger la config passport AVANT d'utiliser passport dans les routes

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données MongoDB
connectDB();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Configuration de la session (necessaire pour passport)
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: false
}));

// Initialisation de Passport et gestion de session
app.use(passport.initialize());
app.use(passport.session());

// Routes de ton API
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Routes Collections, Articles, Feeds
const collectionsRoutes = require('./routes/collections');
app.use('/api/collections', collectionsRoutes);

const articleRoutes = require('./routes/articles');
app.use('/api/articles', articleRoutes);

const feedsRoutes = require('./routes/feeds');
app.use('/api/feeds', feedsRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
