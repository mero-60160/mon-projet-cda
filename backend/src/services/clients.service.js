const prisma = require('../config/db');
const redisClient = require('../config/redis');

class ClientsService {
  async obtenirClients(utilisateurId) {
    const cacheKey = `clients_${utilisateurId}`;
    const cachedClients = await redisClient.get(cacheKey);

    if (cachedClients) {
      return JSON.parse(cachedClients);
    }

    const listeClients = await prisma.client.findMany({
      where: { userId: utilisateurId },
      orderBy: { createdAt: 'desc' }
    });

    // Sauvegarde dans Redis avec expiration (3600 secondes = 1 heure)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(listeClients));

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

    // Invalider le cache pour que la liste se mette à jour
    await redisClient.del(`clients_${utilisateurId}`);

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

    // Invalider le cache
    await redisClient.del(`clients_${utilisateurId}`);

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

    // Invalider le cache
    await redisClient.del(`clients_${utilisateurId}`);
  }
}

module.exports = new ClientsService();
