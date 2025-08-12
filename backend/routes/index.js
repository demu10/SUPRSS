const express = require('express');
const router = express.Router();

router.get('/accueil', (req, res) => {
  res.json({ message: 'Bienvenue sur la page Accueil' });
});

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Dashboard data here' });
});

router.get('/collections', (req, res) => {
  res.json({ message: 'Liste des collections' });
});

router.get('/flux', (req, res) => {
  res.json({ message: 'Flux RSS affichés ici' });
});

router.get('/favoris', (req, res) => {
  res.json({ message: 'Articles favoris' });
});

router.get('/automatisation', (req, res) => {
  res.json({ message: 'Automatisation des flux' });
});

router.get('/recherche', (req, res) => {
  res.json({ message: 'Recherche dans les articles' });
});

router.post('/ajouter-flux', (req, res) => {
  // Ici tu récupères req.body et tu ajoutes un flux
  res.json({ message: 'Flux ajouté' });
});

router.post('/importer', (req, res) => {
  res.json({ message: 'Import réussi' });
});

router.get('/exporter', (req, res) => {
  res.json({ message: 'Export des données' });
});

router.get('/messagerie', (req, res) => {
  res.json({ message: 'Messagerie' });
});

router.get('/preferences', (req, res) => {
  res.json({ message: 'Préférences utilisateur' });
});

module.exports = router;
