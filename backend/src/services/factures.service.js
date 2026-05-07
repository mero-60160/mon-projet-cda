const prisma = require('../config/db');

class FacturesService {
  /**
   * Récupère la liste de toutes les factures de l'utilisateur
   */
  async obtenirFactures(utilisateurId) {
    return await prisma.facture.findMany({
      where: { userId: utilisateurId },
      include: { client: true, devis: true, lignes: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Crée une facture à partir d'un devis existant
   */
  async creerFactureDepuisDevis(identifiantDevis, utilisateurId) {
    // 1. Vérifier que le devis existe, appartient à l'utilisateur, et est "accepté"
    const devis = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: utilisateurId },
      include: { lignes: true }
    });

    if (!devis) {
      throw new Error("Devis introuvable.");
    }
    if (devis.statut !== "accepté" && devis.statut !== "accepte") {
      throw new Error("Impossible de créer une facture : le devis n'est pas accepté.");
    }

    // 2. Vérifier si une facture n'existe pas déjà pour ce devis
    const factureExistante = await prisma.facture.findFirst({
      where: { devisId: identifiantDevis }
    });
    
    if (factureExistante) {
      throw new Error("Une facture existe déjà pour ce devis.");
    }

    // 3. Générer un numéro de facture unique
    const count = await prisma.facture.count();
    const numeroFacture = `FACT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // 4. Copier les lignes
    const lignesFormatees = devis.lignes.map(ligne => ({
      description: ligne.description,
      quantite: ligne.quantite,
      prixUnitaire: ligne.prixUnitaire,
      total: ligne.total
    }));

    // Date d'échéance par défaut : +30 jours
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);

    // 5. Créer la facture
    const nouvelleFacture = await prisma.facture.create({
      data: {
        numero: numeroFacture,
        statut: "en_attente",
        dateEcheance: dateEcheance,
        totalHT: devis.totalHT,
        totalTTC: devis.totalTTC,
        tva: devis.tva,
        notes: devis.notes,
        userId: utilisateurId,
        clientId: devis.clientId,
        devisId: devis.id,
        lignes: {
          create: lignesFormatees
        }
      },
      include: { lignes: true, client: true }
    });

    return nouvelleFacture;
  }

  /**
   * Modifier le statut d'une facture
   */
  async modifierStatutFacture(identifiantFacture, statut, utilisateurId) {
    const factureExistante = await prisma.facture.findFirst({
      where: { id: identifiantFacture, userId: utilisateurId }
    });

    if (!factureExistante) {
      throw new Error("Facture introuvable.");
    }

    return await prisma.facture.update({
      where: { id: identifiantFacture },
      data: { statut }
    });
  }
}

module.exports = new FacturesService();
