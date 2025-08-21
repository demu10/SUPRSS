const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  feedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed', required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
  title: { type: String, required: true },
  link: { type: String, required: true },
  author: { type: String },
  publishedAt: { type: Date },
  summary: { type: String },
  isRead: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);
