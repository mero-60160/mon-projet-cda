const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Accepter les requêtes du frontend
app.use(express.json()); // Comprendre le JSON dans les requêtes

// Importer les différentes routes de l'application
const routesAuthentification = require('./routes/authentification.routes');
const routesClients = require('./routes/clients.routes');
const routesDevis = require('./routes/devis.routes');

// Route de base pour tester que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API du Mini CRM !" });
});

// Enregistrer toutes les routes
app.use('/api/authentification', routesAuthentification);
app.use('/api/clients', routesClients); // L'URL sera http://localhost:3000/api/clients
app.use('/api/devis', routesDevis);     // L'URL sera http://localhost:3000/api/devis

module.exports = app;
