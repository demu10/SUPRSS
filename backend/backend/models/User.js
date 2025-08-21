const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nom: { type: String },
  prenom: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  provider: { type: String, default: 'local', enum: ['local', 'google', 'github', 'both'], },
  isVerified: { type: Boolean, default: false }, // ✅ ajouté pour la confirmation email
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
