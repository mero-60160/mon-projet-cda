const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Inscription d'un utilisateur
 */
exports.inscription = async (req, res) => {
  try {
    const { email, motDePasse, nom, prenom } = req.body;

    // Vérification de l'existence de l'utilisateur
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
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
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
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};
