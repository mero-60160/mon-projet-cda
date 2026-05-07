const express = require('express');
const router = express.Router();
const facturesControleur = require('../controleurs/factures.controleur');
const { verifierToken } = require('../middleware/auth.middleware');

router.use(verifierToken); // Toutes les routes factures nécessitent d'être connecté

// GET /api/factures - Récupérer toutes les factures
router.get('/', facturesControleur.obtenirFactures);

// POST /api/factures/depuis-devis - Créer une facture depuis un devis
router.post('/depuis-devis', facturesControleur.creerFactureDepuisDevis);

// PATCH /api/factures/:id/statut - Modifier le statut d'une facture
router.patch('/:id/statut', facturesControleur.modifierStatutFacture);

module.exports = router;
