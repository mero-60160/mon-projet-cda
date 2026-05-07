const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const optionsSwagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mini CRM',
      version: '1.0.0',
      description: 'Documentation de l\'API du Mini CRM',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // chemins vers les routes pour la doc
};

const swaggerSpec = swaggerJsdoc(optionsSwagger);

const limiteGlobale = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Trop de requêtes, veuillez réessayer plus tard." }
});

const limiteConnexion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 essais max
  message: { message: "Trop de tentatives, veuillez patienter 15 minutes." }
});


const app = express();

// Middleware
app.use(cors()); // Accepter les requêtes du frontend
app.use(express.json()); // Comprendre le JSON dans les requêtes
app.use(limiteGlobale); // Appliquer à toutes les routes


// Importer les différentes routes de l'application
const routesAuthentification = require('./routes/authentification.routes');
const routesClients = require('./routes/clients.routes');
const routesDevis = require('./routes/devis.routes');
const routesFactures = require('./routes/factures.routes');

// Route de base pour tester que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API du Mini CRM !" });
});

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Enregistrer toutes les routes
app.use('/api/authentification', limiteConnexion, routesAuthentification);
app.use('/api/clients', routesClients); // L'URL sera http://localhost:3000/api/clients
app.use('/api/devis', routesDevis);     // L'URL sera http://localhost:3000/api/devis
app.use('/api/factures', routesFactures); // L'URL sera http://localhost:3000/api/factures

module.exports = app;
