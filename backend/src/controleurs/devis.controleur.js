const devisService = require('../services/devis.service');

/**
 * Récupère les devis de l'utilisateur avec le détail client et lignes
 */
exports.obtenirDevis = async (req, res) => {
  try {
    const listeDevis = await devisService.obtenirDevis(req.utilisateurId);
    res.json(listeDevis);
  } catch (erreur) {
    console.error("Erreur obtenirDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (lecture des devis)." });
  }
};

/**
 * Crée un devis complet avec calcul des totaux et lignes
 */
exports.creerDevis = async (req, res) => {
  try {
    const nouveauDevis = await devisService.creerDevis(req.body, req.utilisateurId);
    res.status(201).json(nouveauDevis);
  } catch (erreur) {
    console.error("Erreur creerDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (création du devis)." });
  }
};

/**
 * Supprime un devis
 */
exports.supprimerDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    await devisService.supprimerDevis(identifiantDevis, req.utilisateurId);
    
    res.json({ message: "Devis supprimé de la base." });
  } catch (erreur) {
    if (erreur.message === "Devis introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur supprimerDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (suppression du devis)." });
  }
};

/**
 * Modifie un devis existant et ses lignes
 */
exports.modifierDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    const devisMisAJour = await devisService.modifierDevis(identifiantDevis, req.body, req.utilisateurId);
    
    res.json(devisMisAJour);
  } catch (erreur) {
    if (erreur.message === "Devis introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur modifierDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (modification du devis)." });
  }
};

/**
 * Modifie uniquement le statut d'un devis existant
 */
exports.modifierStatutDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    const devisMisAJour = await devisService.modifierStatutDevis(identifiantDevis, req.body.statut, req.utilisateurId);
    
    res.json(devisMisAJour);
  } catch (erreur) {
    if (erreur.message === "Devis introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur modifierStatutDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (modification du statut)." });
  }
};

/**
 * Génère le PDF d'un devis
 */
exports.genererPDFDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    const { pdfBuffer, devis } = await devisService.genererPDF(identifiantDevis, req.utilisateurId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="devis-${devis.numero}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (erreur) {
    if (erreur.message === "Devis introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur genererPDFDevis:", erreur);
    res.status(500).json({ message: "Erreur serveur (génération du PDF)." });
  }
};

/**
 * Envoie le devis par email au client
 */
exports.envoyerDevisEmail = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    
    const { pdfBuffer, devis } = await devisService.genererPDF(identifiantDevis, req.utilisateurId);

    if (!devis.client || !devis.client.email) {
      return res.status(400).json({ message: "Le client n'a pas d'adresse email renseignée." });
    }

    const emailService = require('../services/email.service');
    const resultat = await emailService.envoyerDevisParEmail(devis.client.email, devis.numero, pdfBuffer);

    await devisService.modifierStatutDevis(identifiantDevis, "envoyé", req.utilisateurId);

    res.json({
      message: "Email envoyé avec succès !",
      messageId: resultat.messageId
    });
  } catch (erreur) {
    if (erreur.message === "Devis introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur envoyerDevisEmail:", erreur);
    res.status(500).json({ message: "Erreur serveur lors de l'envoi de l'email." });
  }
};
