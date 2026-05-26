jest.mock('../config/db', () => ({
  devis: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

const prisma = require('../config/db');
const devisService = require('../services/devis.service');

describe('Devis Service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devrait récupérer la liste des devis de l\'utilisateur', async () => {
    const fakeDevis = [{ id: 1, numero: 'DEV-001', userId: 1 }];
    prisma.devis.findMany.mockResolvedValue(fakeDevis);

    const resultat = await devisService.obtenirDevis(1);

    expect(prisma.devis.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
    expect(resultat).toEqual(fakeDevis);
  });

  it('devrait créer un devis avec le bon total HT et TTC (TVA 20%)', async () => {
    const fakeDevis = { id: 1, totalHT: 100, totalTTC: 120 };
    prisma.devis.create.mockResolvedValue(fakeDevis);

    const donnees = {
      numero: 'DEV-001',
      clientId: 1,
      notes: '',
      tva: 20,
      lignes: [{ description: 'Service', quantite: 2, prixUnitaire: 50 }]
    };

    const resultat = await devisService.creerDevis(donnees, 1);

    expect(prisma.devis.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ totalHT: 100, totalTTC: 120, tva: 20 })
    }));
    expect(resultat).toEqual(fakeDevis);
  });

  it('devrait créer un devis avec TVA à 0% pour un auto-entrepreneur', async () => {
    const fakeDevis = { id: 2, totalHT: 200, totalTTC: 200 };
    prisma.devis.create.mockResolvedValue(fakeDevis);

    const donnees = {
      numero: 'DEV-002', clientId: 1, notes: '', tva: 0,
      lignes: [{ description: 'Prestation', quantite: 1, prixUnitaire: 200 }]
    };

    await devisService.creerDevis(donnees, 1);

    expect(prisma.devis.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ totalHT: 200, totalTTC: 200 })
    }));
  });

  it('devrait lever une erreur si le devis à modifier est introuvable', async () => {
    prisma.devis.findFirst.mockResolvedValue(null);

    await expect(devisService.modifierDevis(99, { lignes: [] }, 1))
      .rejects.toThrow('Devis introuvable.');
  });

  it('devrait modifier le statut d\'un devis existant', async () => {
    prisma.devis.findFirst.mockResolvedValue({ id: 1, userId: 1 });
    prisma.devis.update.mockResolvedValue({ id: 1, statut: 'envoyé' });

    const resultat = await devisService.modifierStatutDevis(1, 'envoyé', 1);

    expect(prisma.devis.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { statut: 'envoyé' }
    }));
    expect(resultat.statut).toBe('envoyé');
  });

  it('devrait lever une erreur si le devis à supprimer est introuvable', async () => {
    prisma.devis.findFirst.mockResolvedValue(null);

    await expect(devisService.supprimerDevis(99, 1))
      .rejects.toThrow('Devis introuvable.');
  });

  it('devrait supprimer un devis existant', async () => {
    prisma.devis.findFirst.mockResolvedValue({ id: 3, userId: 1 });
    prisma.devis.delete.mockResolvedValue({});

    await devisService.supprimerDevis(3, 1);

    expect(prisma.devis.delete).toHaveBeenCalledWith({ where: { id: 3 } });
  });
});
