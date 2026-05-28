#!/bin/bash
set -e

# Dossier local de destination sur le serveur
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p "$BACKUP_DIR"

# Nom du fichier compressé de sauvegarde
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

echo "[INFO] Démarrage de la sauvegarde de la base de données..."

# Exécuter pg_dump dans le conteneur db de manière dynamique et le compresser à la volée
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$FILENAME"

# Conserver uniquement les sauvegardes des 7 derniers jours (nettoyer les anciennes)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -type f -mtime +7 -delete

echo "[SUCCES] Sauvegarde de la base de données terminée : $FILENAME"
echo "[INFO] Liste des sauvegardes actuelles :"
ls -lh "$BACKUP_DIR"
