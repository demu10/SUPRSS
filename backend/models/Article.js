// models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  feedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feed',
    required: true
  },
  collectionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  title: { type: String, required: true },
  link: { type: String, required: true, unique: true }, // unique pour éviter les doublons
  date: { type: Date }, // date de publication
  author: { type: String },
  snippet: { type: String }, // résumé
  content: { type: String }, // contenu complet si dispo
  sourceName: { type: String }, // nom du flux (ex: Le Monde)
  feedUrl: { type: String }, // URL RSS originale
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // marquage lu
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // favoris
}, {
  timestamps: true // createdAt / updatedAt automatiques
});

articleSchema.index({ link: 1 }, { unique: true, sparse: true }); // éviter les doublons
// articleSchema.index({
//   title: 'text',
//   snippet: 'text',
//   content: 'text',
//   sourceName: 'text'
// });


module.exports = mongoose.model('Article', articleSchema);
