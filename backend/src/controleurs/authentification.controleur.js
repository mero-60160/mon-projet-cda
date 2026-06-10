const { z } = require('zod');
const authService = require('../services/authentification.service');

// Validation de l'inscription via Zod
const schemaInscription = z.object({
  email: z.string().email("Le format de l'email est invalide."),
  motDePasse: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères.")
});

/**
 * Inscription d'un utilisateur
 */
exports.inscription = async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom } = req.body;

    // Validation des données par le contrôleur
    const validation = schemaInscription.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Format des données invalide.", 
        erreurs: validation.error.format() 
      });
    }

    // Appel au service
    const nouvelUtilisateur = await authService.inscription(email, motDePasse, nom, prenom);

    res.status(201).json({ message: "Inscription réussie.", utilisateurId: nouvelUtilisateur.id });
  } catch (erreur) {
    if (erreur.message === "Cet email est déjà pris.") {
      return res.status(400).json({ message: erreur.message });
    }
    console.error("Erreur d'inscription:", erreur);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

/**
 * Connexion d'un utilisateur
 */
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Appel au service
    const { utilisateur, token } = await authService.connexion(email, motDePasse);

    res.json({ message: "Connexion réussie.", token, nom: utilisateur.nom, prenom: utilisateur.prenom });
  } catch (erreur) {
    if (erreur.message === "Identifiants invalides.") {
      return res.status(400).json({ message: erreur.message });
    }
    console.error("Erreur de connexion:", erreur);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};
