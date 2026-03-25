const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Récupère les devis de l'utilisateur avec le détail client et lignes
 */
exports.obtenirDevis = async (req, res) => {
  try {
    const listeDevis = await prisma.devis.findMany({
      where: { userId: req.utilisateurId },
      include: { client: true, lignes: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listeDevis);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (lecture des devis)." });
  }
};

/**
 * Crée un devis complet avec calcul des totaux et lignes
 */
exports.creerDevis = async (req, res) => {
  try {
    const { clientId, numero, notes, lignes } = req.body;
    let totalHT = 0;

    // Formatage des lignes et calcul du sous-total
    const lignesFormatees = lignes.map(ligne => {
      const totalLigne = ligne.quantite * ligne.prixUnitaire;
      totalHT += totalLigne;
      return {
        description: ligne.description,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        total: totalLigne
      };
    });

    const tva = 20;
    const totalTTC = totalHT * 1.20; // 20% TVA

    // Transaction Prisma : Création du devis et des lignes
    const nouveauDevis = await prisma.devis.create({
      data: {
        numero,
        totalHT,
        totalTTC,
        tva,
        notes,
        userId: req.utilisateurId,
        clientId,
        lignes: { create: lignesFormatees }
      },
      include: { lignes: true, client: true }
    });

    res.status(201).json(nouveauDevis);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (création du devis)." });
  }
};

/**
 * Supprime un devis
 */
exports.supprimerDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);

    const devisExistant = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: req.utilisateurId }
    });

    if (!devisExistant) {
      return res.status(404).json({ message: "Devis introuvable." });
    }

    await prisma.devis.delete({ where: { id: identifiantDevis } });
    res.json({ message: "Devis supprimé de la base." });
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (suppression du devis)." });
  }
};
