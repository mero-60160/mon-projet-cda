const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const redis = require('redis');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(console.error);

/**
 * Récupère la liste des clients de l'utilisateur connecté
 */
exports.obtenirClients = async (req, res) => {
  try {
    const cacheKey = `clients_${req.utilisateurId}`;
    const cachedClients = await redisClient.get(cacheKey);

    if (cachedClients) {
      return res.json(JSON.parse(cachedClients));
    }

    const listeClients = await prisma.client.findMany({
      where: { userId: req.utilisateurId },
      orderBy: { createdAt: 'desc' }
    });

    // Sauvegarde dans Redis avec expiration (3600 secondes = 1 heure)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(listeClients));

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

    // Invalider le cache pour que la liste se mette à jour
    await redisClient.del(`clients_${req.utilisateurId}`);

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

    // Invalider le cache
    await redisClient.del(`clients_${req.utilisateurId}`);

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

    // Invalider le cache
    await redisClient.del(`clients_${req.utilisateurId}`);

    res.json({ message: "Client supprimé avec succès." });
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
