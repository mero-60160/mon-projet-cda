#!/bin/bash
set -e

# Déploiement sur serveur VPS (Production)
echo "[INFO] Démarrage du déploiement..."

# 1. Mise à jour du code (optionnel si vous tirez depuis Git)
echo "[INFO] Récupération des dernières modifications..."
git fetch origin && git reset --hard origin/main

# 2. Re-build des images Docker
echo "[INFO] Construction des images Docker..."
docker compose build

# 3. Relance des conteneurs
echo "[INFO] Redémarrage des services..."
docker compose up -d

# 3bis. Rechargement de la configuration Caddy (en-têtes de cache, routes...)
# 'up -d' ne recrée pas Caddy si sa définition n'a pas changé : on force le reload.
echo "[INFO] Rechargement de la configuration Caddy..."
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile || docker compose restart caddy

# 4. Diagnostic : test TCP depuis le backend (même chemin que Prisma)
echo "[DIAG] Test TCP depuis backend vers db:5432..."
docker compose exec -T backend node -e "
const net = require('net');
const s = net.createConnection({host:'db', port:5432});
s.on('connect', () => { console.log('[DIAG] TCP OK - db:5432 joignable'); s.destroy(); });
s.on('error', e => console.error('[DIAG] TCP FAIL:', e.message));
setTimeout(() => process.exit(0), 2000);
"

echo "[DIAG] Test auth pg depuis backend..."
docker compose exec -T backend node -e "
const {Client} = require('pg');
const url = process.env.DATABASE_URL;
console.log('[DIAG] URL utilisee:', url ? url.replace(/:([^:@]+)@/, ':[MASQUE]@') : 'UNDEFINED');
const c = new Client({connectionString: url});
c.connect()
  .then(() => { console.log('[DIAG] Auth PG OK'); return c.end(); })
  .catch(e => console.error('[DIAG] Auth PG FAIL:', e.message));
" 2>&1

# 5. Migration de la base de données (Prisma)
echo "[INFO] Application des migrations de base de données..."
docker compose exec -T backend npx prisma migrate deploy

echo "[SUCCES] Déploiement terminé avec succès !"
