#!/bin/bash

# ==============================================================================
# Script de sauvegarde automatique de la base de données Mini CRM
# Auteur : Omer Atici
# Description : Sauvegarde la base de données PostgreSQL via pg_dump 
#               et conserve l'historique sur 30 jours.
# ==============================================================================

# Chemins absolus (Obligatoire pour les tâches CRON)
BACKEND_DIR="/Users/atici/projet_cda/backend"
BACKUP_DIR="${BACKEND_DIR}/backups"

# Format de date pour le nom de fichier
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/crm_backup_${DATE}.sql"

# Durée de rétention (en jours) définie dans le cahier des charges
RETENTION_DAYS=30

# Création du dossier de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Chargement intelligent du .env pour récupérer DATABASE_URL
export $(grep -v '^#' "${BACKEND_DIR}/.env" | xargs)

echo "Démarrage de la sauvegarde de la base de données Mini CRM..."

# Commande pg_dump (Format customisé '-F c' idéal pour la restauration)
pg_dump "$DATABASE_URL" -F c -f "$BACKUP_FILE"

# Vérification du succès de la commande
if [ $? -eq 0 ]; then
  echo "[SUCCES] Sauvegarde reussie : $BACKUP_FILE"
else
  echo "[ERREUR] Echec lors de l'export de la base de donnees."

  exit 1
fi

# Politique de rétention : suppression des fichiers trop anciens
echo "Application de la politique de rétention (suppression au-delà de $RETENTION_DAYS jours)..."
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Processus de sauvegarde terminé avec succès !"
