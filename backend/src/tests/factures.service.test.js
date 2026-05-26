jest.mock('../config/db', () => ({
  facture: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  devis: {
    findFirst: jest.fn()
  }
}));

const prisma = require('../config/db');
const facturesService = require('../services/factures.service');

describe('Factures Service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('devrait récupérer la liste des factures de l\'utilisateur', async () => {
    const fakeFactures = [{ id: 1, numero: 'FACT-2024-001', userId: 1 }];
    prisma.facture.findMany.mockResolvedValue(fakeFactures);

    const resultat = await facturesService.obtenirFactures(1);

    expect(prisma.facture.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
    expect(resultat).toEqual(fakeFactures);
  });

  it('devrait lever une erreur si le devis est introuvable', async () => {
    prisma.devis.findFirst.mockResolvedValue(null);

    await expect(facturesService.creerFactureDepuisDevis(99, 1))
      .rejects.toThrow('Devis introuvable.');
  });

  it('devrait lever une erreur si le devis n\'est pas accepté', async () => {
    prisma.devis.findFirst.mockResolvedValue({ id: 1, statut: 'brouillon', lignes: [] });

    await expect(facturesService.creerFactureDepuisDevis(1, 1))
      .rejects.toThrow("Impossible de créer une facture : le devis n'est pas accepté.");
  });

  it('devrait lever une erreur si une facture existe déjà pour ce devis', async () => {
    prisma.devis.findFirst.mockResolvedValue({ id: 1, statut: 'accepté', lignes: [] });
    prisma.facture.findFirst.mockResolvedValue({ id: 99, devisId: 1 });

    await expect(facturesService.creerFactureDepuisDevis(1, 1))
      .rejects.toThrow('Une facture existe déjà pour ce devis.');
  });

  it('devrait créer une facture correctement depuis un devis accepté', async () => {
    const fakeDevis = {
      id: 2, statut: 'accepté', totalHT: 500, totalTTC: 600, tva: 20,
      notes: '', clientId: 1, lignes: [{ description: 'Test', quantite: 1, prixUnitaire: 500, total: 500 }]
    };
    const fakeFacture = { id: 10, numero: 'FACT-2024-001' };
    prisma.devis.findFirst.mockResolvedValue(fakeDevis);
    prisma.facture.findFirst.mockResolvedValue(null);
    prisma.facture.count.mockResolvedValue(0);
    prisma.facture.create.mockResolvedValue(fakeFacture);

    const resultat = await facturesService.creerFactureDepuisDevis(2, 1);

    expect(prisma.facture.create).toHaveBeenCalledTimes(1);
    expect(resultat).toEqual(fakeFacture);
  });

  it('devrait lever une erreur si la facture à modifier est introuvable', async () => {
    prisma.facture.findFirst.mockResolvedValue(null);

    await expect(facturesService.modifierStatutFacture(99, 'payée', 1))
      .rejects.toThrow('Facture introuvable.');
  });

  it('devrait modifier le statut d\'une facture existante', async () => {
    prisma.facture.findFirst.mockResolvedValue({ id: 5, userId: 1 });
    prisma.facture.update.mockResolvedValue({ id: 5, statut: 'payée' });

    const resultat = await facturesService.modifierStatutFacture(5, 'payée', 1);

    expect(prisma.facture.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { statut: 'payée' }
    }));
    expect(resultat.statut).toBe('payée');
  });
});
