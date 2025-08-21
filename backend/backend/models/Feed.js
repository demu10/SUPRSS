const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: String,
  categories: [String],
  updateFrequency: { type: String, enum: ['hourly', '6hours', 'daily'], default: 'daily' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allowedEditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Feed', feedSchema);
