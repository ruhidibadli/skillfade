#!/bin/bash
#
# SkillFade Database Backup Script
# Creates compressed backups with retention policy
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="db_backup_$TIMESTAMP.sql"

# Database settings (can be overridden via environment)
DB_NAME="${DB_NAME:-skillfade_db}"
DB_USER="${DB_USER:-skillfade_user}"
DB_HOST="${DB_HOST:-localhost}"

print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Starting database backup..."
print_status "Backup directory: $BACKUP_DIR"

# Detect deployment mode and create backup
if command -v docker &> /dev/null && docker ps --format '{{.Names}}' | grep -q "skillfade_db"; then
    # Docker mode
    print_status "Using Docker container for backup..."

    if ! docker exec skillfade_db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"; then
        print_error "Docker backup failed"
        exit 1
    fi
else
    # Manual mode
    print_status "Using local PostgreSQL for backup..."

    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump not found. Install postgresql-client."
        exit 1
    fi

    if ! PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h "$DB_HOST" -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"; then
        print_error "Local backup failed"
        exit 1
    fi
fi

# Compress backup
print_status "Compressing backup..."
if gzip "$BACKUP_DIR/$BACKUP_FILE"; then
    FINAL_FILE="$BACKUP_DIR/${BACKUP_FILE}.gz"
    SIZE=$(du -h "$FINAL_FILE" | cut -f1)
    print_status "Backup created: ${BACKUP_FILE}.gz ($SIZE)"
else
    print_error "Compression failed"
    exit 1
fi

# Cleanup old backups
print_status "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    print_status "Deleted $DELETED old backup(s)"
fi

# List recent backups
echo ""
print_status "Recent backups:"
ls -lh "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | tail -5 | while read line; do
    echo "  $line"
done

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | wc -l)

echo ""
print_status "Backup summary: $BACKUP_COUNT backups, $TOTAL_SIZE total"
print_status "Backup completed successfully"
