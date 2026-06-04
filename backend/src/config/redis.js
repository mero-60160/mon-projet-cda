const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379',
  socket: {
    connectTimeout: 2000,
    // Reconnexion automatique : on retente régulièrement si Redis tombe
    reconnectStrategy: (retries) => Math.min(retries * 200, 3000)
  },
  // Si Redis est déconnecté, les commandes échouent immédiatement
  // au lieu d'être mises en file d'attente (ce qui bloquait les requêtes).
  disableOfflineQueue: true
});

redisClient.on('error', (err) => console.log('Redis indisponible (cache ignoré) :', err.message));

redisClient.connect().catch((err) => console.log('Connexion Redis initiale échouée :', err.message));

module.exports = redisClient;
