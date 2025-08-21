const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  // Référence vers la source
  feedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed' },

  // Relation avec plusieurs collections (si besoin)
  collectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],

  // Données principales (on garde les noms d’origine)
  title: String,
  link: String,              // ancien nom conservé
  date: Date,                // ancien nom conservé
  author: String,
  snippet: String,           // ancien nom conservé
  content: String,
  sourceName: String,
  feedUrl: String,

  // Relations avec les utilisateurs (anciens noms conservés)
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Index unique pour éviter les doublons (ancien champ 'link')
ArticleSchema.index({ link: 1 }, { unique: true, sparse: true });

// Index texte pour recherche (anciens champs conservés)
ArticleSchema.index({
  title: 'text',
  snippet: 'text',
  content: 'text',
  sourceName: 'text'
});

module.exports = mongoose.model('Article', ArticleSchema);
