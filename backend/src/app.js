const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const limiteGlobale = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { message: "Trop de requêtes, veuillez réessayer plus tard." }
});

const limiteConnexion = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 essais (comme décrit dans le cahier des charges)
  message: { message: "Trop de tentatives de connexion, veuillez patienter 15 minutes." }
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

// Route de base pour tester que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API du Mini CRM !" });
});

// Enregistrer toutes les routes
app.use('/api/authentification', limiteConnexion, routesAuthentification);
app.use('/api/clients', routesClients); // L'URL sera http://localhost:3000/api/clients
app.use('/api/devis', routesDevis);     // L'URL sera http://localhost:3000/api/devis

module.exports = app;
