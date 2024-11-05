const express = require('express');
const Chauffeur = require('./chauffeurs'); // Assurez-vous d'importer le modèle ici

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

// Route pour créer un chauffeur
app.post('/api/driver', (req, res, next) => {
    const chauffeur = new Chauffeur({
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        telephone: req.body.telephone,
        vehicule: req.body.vehicule,
        disponibilite: req.body.disponibilite
    });

    chauffeur.save()
        .then(() => res.status(201).json({ message: 'Chauffeur créé' }))
        .catch(error => res.status(400).json({ error }));
});

// Route pour récupérer la liste des chauffeurs
app.get('/api/driver', (req, res, next) => {
    Chauffeur.find() 
        .then(drivers => res.status(200).json(drivers))
        .catch(error => res.status(400).json({ error }));
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
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    Chauffeur.find()
        .skip(skip)
        .limit(limit)
        .then(drivers => {
            Chauffeur.countDocuments().then(count => {
                res.status(200).json({
                    drivers,
                    total: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                });
            });
        })
        .catch(error => res.status(400).json({ error }));
});


// Exporter l'app
module.exports = app;
