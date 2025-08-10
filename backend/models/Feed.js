const FeedSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  tags: [String],
  frequency: { type: String, enum: ['hourly', '6h', 'daily'], default: 'daily' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }
});

module.exports = mongoose.model('Feed', FeedSchema);
