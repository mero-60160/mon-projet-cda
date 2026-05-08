const facturesService = require('../services/factures.service');

exports.obtenirFactures = async (req, res) => {
  try {
    const factures = await facturesService.obtenirFactures(req.utilisateurId);
    res.json(factures);
  } catch (erreur) {
    console.error("Erreur obtenirFactures:", erreur);
    res.status(500).json({ message: "Erreur serveur (lecture des factures)." });
  }
};

exports.creerFactureDepuisDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.body.devisId);
    if (!identifiantDevis) {
      return res.status(400).json({ message: "L'ID du devis est requis." });
    }
    
    const nouvelleFacture = await facturesService.creerFactureDepuisDevis(identifiantDevis, req.utilisateurId);
    res.status(201).json(nouvelleFacture);
  } catch (erreur) {
    if (erreur.message === "Devis introuvable." || erreur.message.includes("Impossible de créer une facture") || erreur.message.includes("existe déjà")) {
      return res.status(400).json({ message: erreur.message });
    }
    console.error("Erreur creerFactureDepuisDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (création de la facture)." });
  }
};

exports.modifierStatutFacture = async (req, res) => {
  try {
    const identifiantFacture = parseInt(req.params.id);
    const factureMiseAJour = await facturesService.modifierStatutFacture(identifiantFacture, req.body.statut, req.utilisateurId);
    
    res.json(factureMiseAJour);
  } catch (erreur) {
    if (erreur.message === "Facture introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur modifierStatutFacture:", erreur);
    res.status(500).json({ message: "Erreur serveur (modification du statut de la facture)." });
  }
};

exports.genererPDF = async (req, res) => {
  try {
    const identifiantFacture = parseInt(req.params.id);
    const resultat = await facturesService.genererPDF(identifiantFacture, req.utilisateurId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${resultat.facture.numero}.pdf`);
    res.send(resultat.pdfBuffer);
  } catch (erreur) {
    console.error("Erreur genererPDF Facture:", erreur);
    res.status(500).json({ message: "Erreur lors de la génération du PDF." });
  }
};
