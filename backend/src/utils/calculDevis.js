function calculerTotalDevis(lignes) {
  let totalHT = 0;
  lignes.forEach(ligne => {
    totalHT += ligne.quantite * ligne.prixUnitaire;
  });
  const tva = 20;
  const totalTTC = totalHT * 1.20;
  return {
    totalHT: Number(totalHT.toFixed(2)),
    totalTTC: Number(totalTTC.toFixed(2)),
    tva
  };
}

module.exports = { calculerTotalDevis };
