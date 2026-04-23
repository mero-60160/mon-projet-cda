const express = require('express');
const router = express.Router();

const controleurAuth = require('../controleurs/authentification.controleur');

/**
 * @swagger
 * /api/authentification/inscription:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur dans les données envoyées
 */
// POST http://localhost:3000/api/authentification/inscription
router.post('/inscription', controleurAuth.inscription);

/**
 * @swagger
 * /api/authentification/connexion:
 *   post:
 *     summary: Connexion d'un utilisateur existant
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token JWT
 *       401:
 *         description: Identifiants invalides
 */
// POST http://localhost:3000/api/authentification/connexion
router.post('/connexion', controleurAuth.connexion);

module.exports = router;
