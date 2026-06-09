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

# 4. Autoriser les connexions TCP non-SSL depuis le réseau Docker (172.x.x.x)
echo "[INFO] Vérification pg_hba.conf..."
docker compose exec -T db bash -c "
  grep -qE '^host[[:space:]]+all[[:space:]]+all[[:space:]]+(all|0\.0\.0\.0/0|172\.)' /var/lib/postgresql/data/pg_hba.conf || \
  { echo 'host all all 0.0.0.0/0 md5' >> /var/lib/postgresql/data/pg_hba.conf && \
    psql -U user -c 'SELECT pg_reload_conf()' > /dev/null && \
    echo '[INFO] pg_hba.conf mis à jour - connexions Docker autorisées'; }
"

# 5. Attente que PostgreSQL soit prêt
echo "[INFO] Attente de PostgreSQL..."
until docker compose exec -T db pg_isready -U user -d crm > /dev/null 2>&1; do
  sleep 1
done

# 6. Migration de la base de données (Prisma)
echo "[INFO] Application des migrations de base de données..."
docker compose exec -T backend npx prisma migrate deploy

echo "[SUCCES] Déploiement terminé avec succès !"
