const express = require('express');
const mongoose = require('mongoose');
const Chauffeur = require('./models/chauffeurs');
const Course = require('./models/courses');
const authMiddleware = require('./middleware/authMiddleware');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();


// Middleware pour gérer les erreurs CORS
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Route pour la racine
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API des chauffeurs et utilisateurs !');
});

// --- ROUTES EXISTANTES POUR LES CHAUFFEURS ---
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

app.get('/api/driver/available', (req, res, next) => {
    Chauffeur.find({ disponibilite: true })
        .then(drivers => res.status(200).json(drivers))
        .catch(error => res.status(400).json({ error }));
});

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

// Route pour récupérer le chauffeurs connecté avec son id
app.get('/api/driver/me', authMiddleware, async (req, res) => {
    try {
      const chauffeurIdFromToken = req.user.id; // ID extrait du token
      console.log('ID du chauffeur depuis le token:', chauffeurIdFromToken);
  
      // Rechercher le chauffeur dans la base de données
      const chauffeur = await Chauffeur.findById(chauffeurIdFromToken);
  
      if (!chauffeur) {
        return res.status(404).json({ message: 'Chauffeur non trouvé' });
      }
  
      return res.status(200).json(chauffeur); // Retourner les informations du chauffeur
    } catch (error) {
      console.error('Erreur interne:', error);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  });
  

// --- ROUTES POUR LES CHAUFFEURS  (INSCRIPTION ET CONNEXION) ---

// Route d'inscription pour un chauffeur uniquement
app.post('/api/register', async (req, res) => {
    const { nom, prenom, email, password, telephone, adresse, vehicule, disponibilite } = req.body;

    console.log("Données reçues :", req.body);
  
    if (!nom || !prenom || !email || !password || !adresse || !telephone || !vehicule || disponibilite === undefined) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
    }
  
    try {
      // Vérifier si l'email existe déjà
      const existingChauffeur = await Chauffeur.findOne({ email });
      if (existingChauffeur) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }
  
      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newChauffeur = new Chauffeur({
        nom,
        prenom,
        email,
        password: hashedPassword,
        telephone,
        adresse,
        vehicule,
        disponibilite,
      });
  
      await newChauffeur.save();
      res.status(201).json({ message: 'Chauffeur inscrit avec succès.' });
      console.log("Données reçues:", req.body);
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      res.status(500).json({ error: error.message || 'Erreur inconnue lors de l\'inscription.' });
    }
  });
  

// Route pour la connexion
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    try {
        const user = await Chauffeur.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); // Comparaison sécurisée
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        // Créer un token JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // Payload du token
            process.env.JWT_SECRET || 'votre_clé_secrète',  // Clé secrète pour signer le token
            { expiresIn: '1h' } // Expiration du token (1h dans cet exemple)
        );

        // Renvoyer le token et d'autres infos si nécessaire
        res.status(200).json({
            token,
            driver: { // Changer 'chauffeur' en 'driver'
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                telephone: user.telephone,
                disponibilite: user.disponibilite
              },
            message: 'Connexion réussie.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Erreur inconnue' });
    }
});

// --- ROUTE POUR LES COURSES DES CHAUFFEURS ---

// 1) ROUTE POUR AJOUTER UNE COURSE (CHAUFFEUR) OK

app.post('/api/driver/course', async (req, res) => {
    const { destination, montant, chauffeurId } = req.body;

    // Vérifiez les champs requis
    if (!destination || !montant || !chauffeurId) {
        return res.status(400).json({ message: 'Tous les champs (destination, montant, chauffeurId) sont requis.' });
    }

    // Vérifiez que chauffeurId est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(chauffeurId)) {
        return res.status(400).json({ message: 'chauffeurId invalide.' });
    }

    try {
        const newCourse = new Course({
            destination,
            montant,
            chauffeur: new mongoose.Types.ObjectId(chauffeurId.toString()),
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course ajoutée avec succès', course: newCourse });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la course:', error);
        res.status(500).json({ message: 'Erreur inconnue lors de l\'ajout de la course.' });
    }
});


// Route pour récuperer les courses d'un chauffeur
app.get('/api/driver/courses', authMiddleware, async (req, res) => {
    const chauffeurId = req.user.id;  // Utiliser req.user pour obtenir l'ID du chauffeur
  
    console.log("ID du chauffeur:", chauffeurId);  // Log pour vérifier
  
    if (!chauffeurId) {
      return res.status(400).json({ message: 'ID du chauffeur manquant.' });
    }
  
    try {
      const courses = await Course.find({ chauffeur: chauffeurId });
  
      if (courses.length === 0) {
        return res.status(404).json({ message: 'Aucune course trouvée pour ce chauffeur.' });
      }
  
      res.status(200).json(courses);
    } catch (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      res.status(500).json({ message: 'Erreur inconnue lors de la récupération des courses.' });
    }
  });
  

// Route pour récupérer toutes les courses (plus tard)
// app.get('/api/courses', async (req, res) => {
//     try {
//         const courses = await Course.find().populate('chauffeur', 'nom prenom email'); 
//         res.status(200).json(courses);
//     } catch (error) {
//         console.error('Erreur lors de la récupération des courses:', error);
//         res.status(500).json({ error: error.message || 'Erreur inconnue lors de la récupération des courses.' });
//     }
// });

// Route pour récupérer les courses avec un statut spécifique (plus tard)
// app.get('/api/courses/status', async (req, res) => {
//     const { statut } = req.query;

//     if (!statut) {
//         return res.status(400).json({ message: 'Le paramètre de statut est requis.' });
//     }

//     try {
//         // Trouver les courses selon le statut
//         const courses = await Course.find({ statut }).populate('chauffeur', 'nom prenom email');
//         res.status(200).json(courses);
//     } catch (error) {
//         console.error('Erreur lors de la récupération des courses par statut:', error);
//         res.status(500).json({ error: error.message || 'Erreur inconnue lors de la récupération des courses par statut.' });
//     }
// });


// Exporter l'app
module.exports = app;