// backend/models/Collection.js
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Enlève les espaces inutiles au début/fin
  },
  description: {
    type: String,
    default: ''
  },
  isShared: {
    type: Boolean,
    default: false
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permissions: {
        canAddFeed: { type: Boolean, default: false },
        canRead: { type: Boolean, default: true },
        canComment: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: false }
      }
    }
  ],
  feeds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feed'
    }
  ]
}, { 
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

module.exports = mongoose.model('Collection', collectionSchema);
