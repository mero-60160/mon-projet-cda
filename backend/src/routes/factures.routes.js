const express = require('express');
const router = express.Router();
const facturesControleur = require('../controleurs/factures.controleur');
const verifierToken = require('../middlewares/authentification.middleware');

router.use(verifierToken); // Toutes les routes factures nécessitent d'être connecté

// GET /api/factures - Récupérer toutes les factures
router.get('/', facturesControleur.obtenirFactures);

// POST /api/factures/depuis-devis - Créer une facture depuis un devis
router.post('/depuis-devis', facturesControleur.creerFactureDepuisDevis);

// PATCH /api/factures/:id/statut - Modifier le statut d'une facture
router.patch('/:id/statut', facturesControleur.modifierStatutFacture);

// GET /api/factures/:id/pdf - Générer le PDF d'une facture
router.get('/:id/pdf', facturesControleur.genererPDF);

module.exports = router;
