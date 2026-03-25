const express = require('express');
const router = express.Router();

const middlewareAuth = require('../middlewares/authentification.middleware');
const controleurClients = require('../controleurs/clients.controleur');

// Application du middleware d'authentification sur toutes ces routes
router.use(middlewareAuth);

// Points d'accès de l'API Clients
router.get('/', controleurClients.obtenirClients);
router.post('/', controleurClients.creerClient);
router.put('/:id', controleurClients.modifierClient);
router.delete('/:id', controleurClients.supprimerClient);

module.exports = router;
