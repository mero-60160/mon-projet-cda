const { calculerTotalDevis } = require('../utils/calculDevis');

describe('Calculs des devis', () => {
  it('doit calculer le total HT et TTC correctement pour une seule ligne', () => {
    const lignes = [{ quantite: 2, prixUnitaire: 50 }];
    const resultat = calculerTotalDevis(lignes);
    expect(resultat.totalHT).toBe(100);
    expect(resultat.totalTTC).toBe(120);
    expect(resultat.tva).toBe(20);
  });

  it('doit calculer le total HT et TTC correctement pour plusieurs lignes', () => {
    const lignes = [
      { quantite: 1, prixUnitaire: 100 },
      { quantite: 3, prixUnitaire: 20 }
    ];
    const resultat = calculerTotalDevis(lignes);
    expect(resultat.totalHT).toBe(160);
    expect(resultat.totalTTC).toBe(192);
  });

  it('doit renvoyer 0 si aucune ligne', () => {
    const resultat = calculerTotalDevis([]);
    expect(resultat.totalHT).toBe(0);
    expect(resultat.totalTTC).toBe(0);
  });
});
