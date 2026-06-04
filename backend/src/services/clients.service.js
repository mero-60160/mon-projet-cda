const prisma = require('../config/db');
const redisClient = require('../config/redis');

class ClientsService {
  async obtenirClients(utilisateurId) {
    const cacheKey = `clients_${utilisateurId}`;

    try {
      const cachedClients = await redisClient.get(cacheKey);
      if (cachedClients) return JSON.parse(cachedClients);
    } catch (_) {}

    const listeClients = await prisma.client.findMany({
      where: { userId: utilisateurId },
      orderBy: { createdAt: 'desc' }
    });

    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(listeClients));
    } catch (_) {}

    return listeClients;
  }

  async creerClient(donneesFormulaire, utilisateurId) {
    const nouveauClient = await prisma.client.create({
      data: {
        nom: donneesFormulaire.nom,
        prenom: donneesFormulaire.prenom,
        email: donneesFormulaire.email,
        telephone: donneesFormulaire.telephone,
        entreprise: donneesFormulaire.entreprise,
        adresse: donneesFormulaire.adresse,
        userId: utilisateurId 
      }
    });

    try { await redisClient.del(`clients_${utilisateurId}`); } catch (_) {}

    return nouveauClient;
  }

  async modifierClient(identifiantClient, donnees, utilisateurId) {
    // Vérification de la propriété du client
    const clientExistant = await prisma.client.findFirst({
      where: { id: identifiantClient, userId: utilisateurId }
    });

    if (!clientExistant) {
      throw new Error("Client introuvable.");
    }

    const clientMisAJour = await prisma.client.update({
      where: { id: identifiantClient },
      data: donnees
    });

    try { await redisClient.del(`clients_${utilisateurId}`); } catch (_) {}

    return clientMisAJour;
  }

  async supprimerClient(identifiantClient, utilisateurId) {
    const clientExistant = await prisma.client.findFirst({
      where: { id: identifiantClient, userId: utilisateurId }
    });

    if (!clientExistant) {
      throw new Error("Client introuvable.");
    }

    await prisma.client.delete({ where: { id: identifiantClient } });

    try { await redisClient.del(`clients_${utilisateurId}`); } catch (_) {}
  }
}

module.exports = new ClientsService();
