// Mocks en premier avant les imports
jest.mock('../config/db', () => ({
  client: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../config/redis', () => ({
  get: jest.fn().mockResolvedValue(null),
  setEx: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1)
}));

const prisma = require('../config/db');
const redisClient = require('../config/redis');
const clientsService = require('../services/clients.service');

describe('Clients Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Par défaut Redis ne retourne rien (pas de cache)
    redisClient.get.mockResolvedValue(null);
  });

  it('devrait retourner la liste des clients depuis la base de données', async () => {
    const fakeClients = [
      { id: 1, nom: 'Atici', prenom: 'Omer', userId: 1 },
      { id: 2, nom: 'Martin', prenom: 'Marie', userId: 1 }
    ];
    prisma.client.findMany.mockResolvedValue(fakeClients);

    const resultat = await clientsService.obtenirClients(1);

    expect(prisma.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
    expect(resultat).toEqual(fakeClients);
  });

  it('devrait retourner les clients depuis le cache Redis si disponible', async () => {
    const clientsEnCache = [{ id: 3, nom: 'Cache', prenom: 'Test', userId: 1 }];
    redisClient.get.mockResolvedValue(JSON.stringify(clientsEnCache));

    const resultat = await clientsService.obtenirClients(1);

    expect(prisma.client.findMany).not.toHaveBeenCalled();
    expect(resultat).toEqual(clientsEnCache);
  });

  it('devrait créer un client et invalider le cache', async () => {
    const donneesClient = { nom: 'Nouveau', prenom: 'Client', email: 'new@test.com' };
    const clientCree = { id: 10, ...donneesClient, userId: 1 };
    prisma.client.create.mockResolvedValue(clientCree);

    const resultat = await clientsService.creerClient(donneesClient, 1);

    expect(prisma.client.create).toHaveBeenCalledTimes(1);
    expect(redisClient.del).toHaveBeenCalledWith('clients_1');
    expect(resultat).toEqual(clientCree);
  });

  it('devrait lever une erreur si on essaie de modifier un client inexistant', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(clientsService.modifierClient(999, { nom: 'Ghost' }, 1))
      .rejects
      .toThrow('Client introuvable.');
  });

  it('devrait supprimer un client existant et invalider le cache', async () => {
    const clientExistant = { id: 5, nom: 'A supprimer', userId: 1 };
    prisma.client.findFirst.mockResolvedValue(clientExistant);
    prisma.client.delete.mockResolvedValue(clientExistant);

    await clientsService.supprimerClient(5, 1);

    expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(redisClient.del).toHaveBeenCalledWith('clients_1');
  });

  it('devrait lever une erreur si on essaie de supprimer un client inexistant', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(clientsService.supprimerClient(999, 1))
      .rejects
      .toThrow('Client introuvable.');
  });

  it('devrait modifier un client existant et invalider le cache', async () => {
    const clientExistant = { id: 7, nom: 'Ancien', userId: 1 };
    const clientMisAJour = { id: 7, nom: 'Nouveau', userId: 1 };
    prisma.client.findFirst.mockResolvedValue(clientExistant);
    prisma.client.update.mockResolvedValue(clientMisAJour);

    const resultat = await clientsService.modifierClient(7, { nom: 'Nouveau' }, 1);

    expect(prisma.client.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 7 }
    }));
    expect(redisClient.del).toHaveBeenCalledWith('clients_1');
    expect(resultat).toEqual(clientMisAJour);
  });
});
