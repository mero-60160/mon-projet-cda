#!/bin/bash
set -e

# Déploiement sur serveur de Staging (VPS)
echo "[INFO] Démarrage du déploiement en Staging..."

# 1. Mise à jour du code (optionnel si vous tirez depuis Git)
echo "[INFO] Récupération des dernières modifications..."
git pull origin main

# 2. Re-build des images Docker
echo "[INFO] Construction des images Docker..."
docker compose -f docker-compose.staging.yml build

# 3. Relance des conteneurs
echo "[INFO] Redémarrage des services..."
docker compose -f docker-compose.staging.yml up -d

# 4. Migration de la base de données (Prisma)
echo "[INFO] Application des migrations de base de données..."
docker compose -f docker-compose.staging.yml exec -T backend npx prisma migrate deploy
docker compose -f docker-compose.staging.yml exec -T backend npx prisma db seed

echo "[SUCCES] Déploiement en Staging terminé avec succès !"
