require('dotenv').config();
require('./config/passport');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/db');

// IMPORTANT : charger la config passport AVANT d'utiliser passport dans les routes

const app = express();

// Connexion à la base de données MongoDB
connectDB();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // pour permettre cookies et sessions
}));

// Pour parser le JSON dans les requêtes POST/PUT
app.use(express.json());

// Configuration de la session (necessaire pour passport)
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
}));

// Initialisation de Passport et gestion de session
app.use(passport.initialize());
app.use(passport.session());

// Routes de ton API
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));


// Import des routes
const collectionsRoutes = require('./routes/collections');
app.use('/api/collections', collectionsRoutes);

const articleRoutes = require('./routes/articles');
app.use('/api/articles', articleRoutes);


// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
