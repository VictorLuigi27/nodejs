// ça c'est pour les routes API pour que le front-end les récupères

const express = require('express');
const Chauffeur = require('./models/chauffeurs');

const app = express();

// Middleware pour gérer les erreurs CORS
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Route pour la racine
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API des chauffeurs !');
});

// Pour ajouter un chauffeur
app.post('/api/driver', (req, res, next) => {
    console.log(req.body); 
    const chauffeur = new Chauffeur({
      nom: req.body.nom,
      prenom: req.body.prenom,
      email: req.body.email,
      telephone: req.body.telephone,
      vehicule: req.body.vehicule,
      disponibilite: req.body.disponibilite,
      adresse: req.body.adresse,
    });
  
    chauffeur.save()
      .then(() => res.status(201).json({ message: 'Chauffeur créé' }))
      .catch(error => {
        console.error('Erreur lors de l\'ajout du chauffeur:', error);
        res.status(400).json({ error: error.message || 'Erreur inconnue' });
      });
  });
  

// Route pour mettre à jour un chauffeur
app.patch('/api/driver/:id', (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body; 

    
    if (updatedData._id) {
        delete updatedData._id; 
    }

    Chauffeur.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
        .then(driver => {
            if (!driver) {
                return res.status(404).json({ message: 'Chauffeur non trouvé' });
            }
            res.status(200).json(driver); 
        })
        .catch(error => res.status(400).json({ error })); 
});

// Route pour supprimer un chauffeur
app.delete('/api/driver/:id', (req, res, next) => {
    const { id } = req.params; 

    Chauffeur.findByIdAndDelete(id) 
        .then(driver => {
            if (!driver) {
                return res.status(404).json({ message: 'Chauffeur non trouvé' });
            }
            res.status(200).json({ message: 'Chauffeur supprimé' }); 
        })
        .catch(error => res.status(400).json({ error })); 
});

// Route pour récupérer les chauffeurs par disponibilité
app.get('/api/driver/available', (req, res, next) => {
    Chauffeur.find({ disponibilite: true }) 
        .then(drivers => res.status(200).json(drivers))
        .catch(error => res.status(400).json({ error }));
});

// Route pour récupérer la liste paginée des chauffeurs
app.get('/api/driver', (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit);

    const skip = limit > 0 ? (page - 1) * limit : 0; 

    const query = Chauffeur.find();
    if (limit > 0) query.skip(skip).limit(limit); 

    query
        .then(drivers => {
            Chauffeur.countDocuments().then(count => {
                res.status(200).json({
                    drivers,
                    total: count,
                    totalPages: limit > 0 ? Math.ceil(count / limit) : 1,
                    currentPage: limit > 0 ? page : 1,
                });
            });
        })
        .catch(error => res.status(400).json({ error }));
});
// Exporter l'app
module.exports = app;