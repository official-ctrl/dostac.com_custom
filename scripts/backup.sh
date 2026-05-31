#!/bin/bash
# dostac DB 자동 백업 스크립트
# 매일 새벽 2시 실행, 최근 14일치 보관

set -euo pipefail

BACKUP_DIR="${HOME}/dostac-backups"
DB_URL="postgresql://dostac:dostac_dev@localhost:5432/dostac"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
FILENAME="dostac_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# PostgreSQL 컨테이너에서 pg_dump 실행
docker exec dostac-web-db-1 \
  pg_dump -U dostac -d dostac --no-owner --no-acl -Fp \
  | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "[$(date)] 백업 완료: ${BACKUP_DIR}/${FILENAME}"

# 14일 이상 된 백업 삭제
find "${BACKUP_DIR}" -name "dostac_backup_*.sql.gz" -mtime +14 -delete
echo "[$(date)] 오래된 백업 정리 완료"
