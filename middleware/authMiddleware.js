//  ICI QUE POUR DECODER LE TOKEN

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  // Vérifier si le token est dans l'en-tête Authorization
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }

  try {
    // Décoder le token pour récupérer les informations de l'utilisateur (ex: ID du chauffeur)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifie les données décodées du token
    console.log('Données du token décodées:', decoded); // Assure-toi que l'ID du chauffeur est dedans
    
    // Ajouter les données du chauffeur dans la requête
    req.user = decoded;

    next(); // Passe au prochain middleware ou à la route
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;
