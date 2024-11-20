const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adresse: { type: String, required: true },
  voiture: { type: String, required: true },
  disponibilite: { type: Boolean, default: true },
  role: { type: String, required: true, enum: ['chauffeur', 'utilisateur'] }
});

module.exports = mongoose.model('User', userSchema);
