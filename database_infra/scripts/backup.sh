#!/usr/bin/env bash
set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/upsc_tutor_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting automated backup for upsc_tutor..."
docker exec -t upsc_db_service pg_dump -U postgres -d upsc_tutor | gzip > "${BACKUP_FILE}"
echo "Backup successfully saved to ${BACKUP_FILE}"