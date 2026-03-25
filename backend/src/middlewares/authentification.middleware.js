const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT dans l'en-tête de la requête.
 */
module.exports = (req, res, next) => {
  try {
    const enTeteAutorisation = req.headers.authorization;
    
    if (!enTeteAutorisation) {
      return res.status(401).json({ message: "Requête non authentifiée. Token manquant." });
    }

    // Récupération du token après le mot clé "Bearer"
    const token = enTeteAutorisation.split(' ')[1];
    
    // Vérification du token via la clé secrète
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    
    // Transmission de l'ID utilisateur aux routes suivantes
    req.utilisateurId = tokenDecode.id;
    next();
    
  } catch (erreur) {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};
