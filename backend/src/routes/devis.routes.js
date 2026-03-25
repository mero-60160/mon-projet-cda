const express = require('express');
const router = express.Router();

const middlewareAuth = require('../middlewares/authentification.middleware');
const controleurDevis = require('../controleurs/devis.controleur');

// Filtrage pour restreindre l'accès
router.use(middlewareAuth);

// Points d'accès de l'API Devis
router.get('/', controleurDevis.obtenirDevis);
router.post('/', controleurDevis.creerDevis);
router.delete('/:id', controleurDevis.supprimerDevis);

module.exports = router;
