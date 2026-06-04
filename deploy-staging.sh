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

# 4. Migration de la base de données (Prisma)
echo "[INFO] Application des migrations de base de données..."
docker compose exec -T backend npx prisma migrate deploy

echo "[SUCCES] Déploiement terminé avec succès !"
