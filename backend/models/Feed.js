const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String },
  categories: [String],
  updateFrequency: { type: String, enum: ['hourly', '6h', 'daily'], default: 'daily' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection', required: true },
  membersCanEdit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feed', feedSchema);
