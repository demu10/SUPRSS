const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  permissions: {
    read: { type: Boolean, default: true },
    comment: { type: Boolean, default: true },
    addFeeds: { type: Boolean, default: false }
  }
});

const CollectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isShared: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [MemberSchema],
  feeds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feed' }]
});

module.exports = mongoose.model('Collection', CollectionSchema);
