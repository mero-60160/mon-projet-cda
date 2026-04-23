const express = require('express');
const router = express.Router();

const middlewareAuth = require('../middlewares/authentification.middleware');
const controleurClients = require('../controleurs/clients.controleur');

// Application du middleware d'authentification sur toutes ces routes
router.use(middlewareAuth);

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Récupérer la liste des clients de l'utilisateur connecté
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 *       401:
 *         description: Non autorisé
 */
router.get('/', controleurClients.obtenirClients);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Créer un nouveau client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               entreprise:
 *                 type: string
 *               adresse:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *       401:
 *         description: Non autorisé
 */
router.post('/', controleurClients.creerClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Modifier un client existant
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Client modifié avec succès
 *       404:
 *         description: Client introuvable
 */
router.put('/:id', controleurClients.modifierClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Supprimer un client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du client
 *     responses:
 *       200:
 *         description: Client supprimé
 *       404:
 *         description: Client introuvable
 */
router.delete('/:id', controleurClients.supprimerClient);

module.exports = router;
