const clientsService = require('../services/clients.service');

/**
 * Récupère la liste des clients de l'utilisateur connecté
 */
exports.obtenirClients = async (req, res) => {
  try {
    const listeClients = await clientsService.obtenirClients(req.utilisateurId);
    res.json(listeClients);
  } catch (erreur) {
    console.error("Erreur obtenirClients:", erreur);
    res.status(500).json({ message: "Erreur lors de la récupération des clients." });
  }
};

/**
 * Crée un nouveau client
 */
exports.creerClient = async (req, res) => {
  try {
    const nouveauClient = await clientsService.creerClient(req.body, req.utilisateurId);
    res.status(201).json(nouveauClient);
  } catch (erreur) {
    console.error("Erreur creerClient:", erreur);
    res.status(500).json({ message: "Erreur lors de la création du client." });
  }
};

/**
 * Modifie un client existant
 */
exports.modifierClient = async (req, res) => {
  try {
    const identifiantClient = parseInt(req.params.id);
    const clientMisAJour = await clientsService.modifierClient(identifiantClient, req.body, req.utilisateurId);
    
    res.json(clientMisAJour);
  } catch (erreur) {
    if (erreur.message === "Client introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur modifierClient:", erreur);
    res.status(500).json({ message: "Erreur lors de la modification du client." });
  }
};

/**
 * Supprime un client
 */
exports.supprimerClient = async (req, res) => {
  try {
    const identifiantClient = parseInt(req.params.id);
    await clientsService.supprimerClient(identifiantClient, req.utilisateurId);
    
    res.json({ message: "Client supprimé avec succès." });
  } catch (erreur) {
    if (erreur.message === "Client introuvable.") {
      return res.status(404).json({ message: erreur.message });
    }
    console.error("Erreur supprimerClient:", erreur);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
