const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 🔄 harmonisé avec frontend
  url: { type: String, required: true },
  description: { type: String },
  categories: [String],
  updateFrequency: { 
    type: String, 
    enum: ['hourly', '6hours', 'daily'], // 🔄 harmonisé avec frontend
    default: 'daily' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  collectionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Collection', 
    default: null // 🔄 pas obligatoire
  },
  membersCanEdit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true }); // 🔄 gère createdAt & updatedAt automatiquement

module.exports = mongoose.model('Feed', feedSchema);
