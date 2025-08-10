const ArticleSchema = new mongoose.Schema({
  feedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feed' },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  title: String,
  url: String,
  author: String,
  contentSnippet: String,
  publishedAt: Date,
  keywords: [String],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Article', ArticleSchema);