const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Récupère la liste des clients de l'utilisateur connecté
 */
exports.obtenirClients = async (req, res) => {
  try {
    const listeClients = await prisma.client.findMany({
      where: { userId: req.utilisateurId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listeClients);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la récupération des clients." });
  }
};

/**
 * Crée un nouveau client
 */
exports.creerClient = async (req, res) => {
  try {
    const donneesFormulaire = req.body;
    const nouveauClient = await prisma.client.create({
      data: {
        nom: donneesFormulaire.nom,
        prenom: donneesFormulaire.prenom,
        email: donneesFormulaire.email,
        telephone: donneesFormulaire.telephone,
        entreprise: donneesFormulaire.entreprise,
        adresse: donneesFormulaire.adresse,
        userId: req.utilisateurId 
      }
    });
    res.status(201).json(nouveauClient);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la création du client." });
  }
};

/**
 * Modifie un client existant
 */
exports.modifierClient = async (req, res) => {
  try {
    const identifiantClient = parseInt(req.params.id);
    
    // Vérification de la propriété du client
    const clientExistant = await prisma.client.findFirst({
      where: { id: identifiantClient, userId: req.utilisateurId }
    });

    if (!clientExistant) {
      return res.status(404).json({ message: "Client introuvable." });
    }

    const clientMisAJour = await prisma.client.update({
      where: { id: identifiantClient },
      data: req.body
    });

    res.json(clientMisAJour);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la modification du client." });
  }
};

/**
 * Supprime un client
 */
exports.supprimerClient = async (req, res) => {
  try {
    const identifiantClient = parseInt(req.params.id);

    const clientExistant = await prisma.client.findFirst({
      where: { id: identifiantClient, userId: req.utilisateurId }
    });

    if (!clientExistant) {
      return res.status(404).json({ message: "Client introuvable." });
    }

    await prisma.client.delete({ where: { id: identifiantClient } });
    res.json({ message: "Client supprimé avec succès." });
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
