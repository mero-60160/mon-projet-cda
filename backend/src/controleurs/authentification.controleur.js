const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const { z } = require('zod');

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

    // Validation des données
    const validation = schemaInscription.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Format des données invalide.", 
        erreurs: validation.error.format() 
      });
    }

    // 2. Vérification de l'existence de l'utilisateur
    const utilisateurExistant = await prisma.user.findUnique({ where: { email } });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Cet email est déjà pris." });
    }

    // Hashage du mot de passe
    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(motDePasse, sel);

    // Insertion en base de données
    const nouvelUtilisateur = await prisma.user.create({
      data: { 
        email, 
        password: motDePasseHache, // 'password' car c'est le nom de ta table Prisma 
        nom, 
        prenom 
      }
    });

    res.status(201).json({ message: "Inscription réussie.", utilisateurId: nouvelUtilisateur.id });
  } catch (erreur) {
    console.error("Erreur d'inscription:", erreur);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription.", details: erreur.message });
  }
};

/**
 * Connexion d'un utilisateur
 */
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const utilisateur = await prisma.user.findUnique({ where: { email } });
    if (!utilisateur) {
      return res.status(400).json({ message: "Identifiants invalides." });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.password);
    if (!motDePasseValide) {
      return res.status(400).json({ message: "Identifiants invalides." });
    }

    // Génération du token JWT (valide 24h)
    const token = jwt.sign(
      { id: utilisateur.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: "Connexion réussie.", token, nom: utilisateur.nom, prenom: utilisateur.prenom });
  } catch (erreur) {
    console.error("Erreur de connexion:", erreur);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};
