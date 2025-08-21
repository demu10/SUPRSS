const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nom: { type: String },
  prenom: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false }, // mot de passe caché par défaut
  googleId: { type: String },
  githubId: { type: String },
  provider: {
    type: String,
    default: 'local',
    enum: ['local', 'google', 'github', 'both'],
  },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Hash mot de passe si modifié
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Comparer le mot de passe
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
