const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://victor:QXCUbMrUza6vau93@cluster0.v3asx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch((error) => console.log('Connexion à MongoDB échouée', error));


// Schéma pour le chauffeur
const chauffeur = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  vehicule: { type: String, required: true },
  disponibilite: { type: Boolean, required: true }
});

// Créer le modèle à partir du schéma
const Chauffeur = mongoose.model('Chauffeur', chauffeur);

// Exporter
module.exports = Chauffeur;
