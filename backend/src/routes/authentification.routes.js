const express = require('express');
const router = express.Router();

const controleurAuth = require('../controleurs/authentification.controleur');

// POST http://localhost:3000/api/authentification/inscription
router.post('/inscription', controleurAuth.inscription);

// POST http://localhost:3000/api/authentification/connexion
router.post('/connexion', controleurAuth.connexion);

module.exports = router;
