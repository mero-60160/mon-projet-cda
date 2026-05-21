const express = require('express');
const router = express.Router();

const middlewareAuth = require('../middlewares/authentification.middleware');
const controleurDevis = require('../controleurs/devis.controleur');

// Filtrage pour restreindre l'accès
router.use(middlewareAuth);

/**
 * @swagger
 * /api/devis:
 *   get:
 *     summary: Récupérer la liste des devis de l'utilisateur connecté
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des devis
 *       401:
 *         description: Non autorisé
 */
router.get('/', controleurDevis.obtenirDevis);

/**
 * @swagger
 * /api/devis:
 *   post:
 *     summary: Créer un nouveau devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: integer
 *               montant:
 *                 type: number
 *               numero:
 *                 type: string
 *               statut:
 *                 type: string
 *               dateEmission:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Devis créé avec succès
 *       401:
 *         description: Non autorisé
 */
router.post('/', controleurDevis.creerDevis);

/**
 * @swagger
 * /api/devis/{id}:
 *   put:
 *     summary: Modifier un devis existant
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Devis modifié avec succès
 *       404:
 *         description: Devis introuvable
 */
router.put('/:id', controleurDevis.modifierDevis);

/**
 * @swagger
 * /api/devis/{id}/statut:
 *   patch:
 *     summary: Modifier le statut d'un devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du devis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut du devis modifié avec succès
 *       404:
 *         description: Devis introuvable
 */
router.patch('/:id/statut', controleurDevis.modifierStatutDevis);

/**
 * @swagger
 * /api/devis/{id}:
 *   delete:
 *     summary: Supprimer un devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du devis
 *     responses:
 *       200:
 *         description: Devis supprimé avec succès
 *       404:
 *         description: Devis introuvable
 */
router.delete('/:id', controleurDevis.supprimerDevis);

/**
 * @swagger
 * /api/devis/{id}/pdf:
 *   get:
 *     summary: Générer un PDF pour un devis
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du devis
 *     responses:
 *       200:
 *         description: PDF généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Devis introuvable
 */
router.get('/:id/pdf', controleurDevis.genererPDFDevis);

/**
 * @swagger
 * /api/devis/{id}/send:
 *   post:
 *     summary: Envoyer un devis par email au client
 *     tags: [Devis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: L'ID du devis
 *     responses:
 *       200:
 *         description: Email envoyé avec succès
 *       400:
 *         description: Le client n'a pas d'adresse email
 *       404:
 *         description: Devis introuvable
 */
router.post('/:id/send', controleurDevis.envoyerDevisEmail);

module.exports = router;
