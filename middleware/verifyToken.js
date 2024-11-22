const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extraire le token de l'en-tête Authorization
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  // Vérifier le token avec le secret
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide' });
    }

    // Si tout va bien, ajouter l'utilisateur à la requête
    req.user = user;
    next(); // Passer à la prochaine étape (la route)
  });
};


module.exports = verifyToken;
