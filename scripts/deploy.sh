#!/bin/bash
#
# SkillFade Deployment Script
# Handles updates, builds, migrations, and restarts
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="/var/log/skillfade"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Deployment mode
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
fi

# Default options
SKIP_BACKUP=false
SKIP_BUILD=false
SKIP_MIGRATIONS=false
FORCE=false
BRANCH="main"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║           SkillFade Deployment Script                     ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -b, --branch NAME   Git branch to deploy (default: main)"
    echo "  --skip-backup       Skip database backup before deploy"
    echo "  --skip-build        Skip building containers/assets"
    echo "  --skip-migrations   Skip database migrations"
    echo "  --force             Force deployment without confirmations"
    echo "  --docker            Force Docker deployment mode"
    echo "  --manual            Force manual deployment mode"
    echo ""
    echo "Examples:"
    echo "  $0                      # Standard deployment"
    echo "  $0 -b develop           # Deploy develop branch"
    echo "  $0 --skip-backup        # Deploy without backup"
    echo "  $0 --force              # Deploy without confirmations"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -b|--branch)
                BRANCH="$2"
                shift 2
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --docker)
                DEPLOY_MODE="docker"
                shift
                ;;
            --manual)
                DEPLOY_MODE="manual"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

detect_deploy_mode() {
    if [ -n "$DEPLOY_MODE" ]; then
        return
    fi

    if command -v docker &> /dev/null && [ -f "$DOCKER_COMPOSE_FILE" ]; then
        DEPLOY_MODE="docker"
    else
        DEPLOY_MODE="manual"
    fi
}

confirm() {
    if [ "$FORCE" = true ]; then
        return 0
    fi

    read -p "$1 (y/N) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        print_warning "Skipping database backup"
        return 0
    fi

    print_step "Creating database backup..."

    mkdir -p "$BACKUP_DIR"

    if [ "$DEPLOY_MODE" = "docker" ]; then
        if docker ps --format '{{.Names}}' | grep -q "skillfade_db"; then
            docker exec skillfade_db pg_dump -U skillfade_user skillfade_db > "$BACKUP_DIR/pre_deploy_$TIMESTAMP.sql"
            gzip "$BACKUP_DIR/pre_deploy_$TIMESTAMP.sql"
            print_success "Backup created: pre_deploy_$TIMESTAMP.sql.gz"
        else
            print_warning "Database container not running - skipping backup"
        fi
    else
        if command -v pg_dump &> /dev/null; then
            PGPASSWORD="${DB_PASSWORD:-}" pg_dump -h localhost -U skillfade_user skillfade_db > "$BACKUP_DIR/pre_deploy_$TIMESTAMP.sql" 2>/dev/null || true
            if [ -f "$BACKUP_DIR/pre_deploy_$TIMESTAMP.sql" ]; then
                gzip "$BACKUP_DIR/pre_deploy_$TIMESTAMP.sql"
                print_success "Backup created: pre_deploy_$TIMESTAMP.sql.gz"
            else
                print_warning "Could not create backup - continuing anyway"
            fi
        else
            print_warning "pg_dump not available - skipping backup"
        fi
    fi
}

pull_latest_code() {
    print_step "Pulling latest code from $BRANCH..."

    cd "$PROJECT_DIR"

    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        print_warning "Uncommitted changes detected"
        if ! confirm "Stash changes and continue?"; then
            print_error "Deployment cancelled"
            exit 1
        fi
        git stash
    fi

    # Fetch and checkout
    git fetch origin
    git checkout "$BRANCH"
    git pull origin "$BRANCH"

    print_success "Code updated to latest $BRANCH"
}

deploy_docker() {
    print_step "Deploying with Docker..."

    cd "$PROJECT_DIR"

    if [ "$SKIP_BUILD" = false ]; then
        print_step "Building Docker images..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
        print_success "Images built"
    fi

    print_step "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down

    print_step "Starting containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

    # Wait for services to be ready
    print_step "Waiting for services to start..."
    sleep 10

    # Check if backend is healthy
    local retries=30
    while [ $retries -gt 0 ]; do
        if docker exec skillfade_backend curl -s http://localhost:8000/health > /dev/null 2>&1; then
            break
        fi
        retries=$((retries - 1))
        sleep 2
    done

    if [ $retries -eq 0 ]; then
        print_warning "Backend may not be fully ready"
    fi

    print_success "Containers started"
}

deploy_manual() {
    print_step "Deploying manually..."

    # Backend
    print_step "Updating backend..."
    cd "$PROJECT_DIR/backend"

    if [ ! -d "venv" ]; then
        print_step "Creating virtual environment..."
        python3.11 -m venv venv
    fi

    source venv/bin/activate

    print_step "Installing dependencies..."
    pip install --upgrade pip -q
    pip install -r requirements.txt -q

    deactivate

    # Frontend
    if [ "$SKIP_BUILD" = false ]; then
        print_step "Building frontend..."
        cd "$PROJECT_DIR/frontend"

        npm ci --silent
        npm run build

        print_success "Frontend built"
    fi

    # Restart services
    print_step "Restarting services..."

    if command -v supervisorctl &> /dev/null; then
        sudo supervisorctl restart skillfade-backend || true
    fi

    if command -v systemctl &> /dev/null; then
        sudo systemctl reload nginx || true
    fi

    print_success "Services restarted"
}

run_migrations() {
    if [ "$SKIP_MIGRATIONS" = true ]; then
        print_warning "Skipping database migrations"
        return 0
    fi

    print_step "Running database migrations..."

    if [ "$DEPLOY_MODE" = "docker" ]; then
        docker exec skillfade_backend alembic upgrade head
    else
        cd "$PROJECT_DIR/backend"
        source venv/bin/activate
        alembic upgrade head
        deactivate
    fi

    print_success "Migrations completed"
}

run_healthcheck() {
    print_step "Running health check..."

    if [ -x "$SCRIPT_DIR/healthcheck.sh" ]; then
        if "$SCRIPT_DIR/healthcheck.sh" -q; then
            print_success "Health check passed"
            return 0
        else
            print_error "Health check failed"
            return 1
        fi
    else
        # Fallback basic check
        sleep 5
        if curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null | grep -q "200"; then
            print_success "Health check passed"
            return 0
        else
            print_error "Health check failed"
            return 1
        fi
    fi
}

cleanup_old_backups() {
    print_step "Cleaning up old backups..."

    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete 2>/dev/null || true
        print_success "Old backups cleaned"
    fi
}

rollback() {
    print_error "Deployment failed! Attempting rollback..."

    local latest_backup=$(ls -t "$BACKUP_DIR"/pre_deploy_*.sql.gz 2>/dev/null | head -1)

    if [ -z "$latest_backup" ]; then
        print_error "No backup found for rollback"
        exit 1
    fi

    print_step "Restoring from $latest_backup..."

    if [ "$DEPLOY_MODE" = "docker" ]; then
        gunzip -c "$latest_backup" | docker exec -i skillfade_db psql -U skillfade_user skillfade_db
    else
        gunzip -c "$latest_backup" | PGPASSWORD="${DB_PASSWORD:-}" psql -h localhost -U skillfade_user skillfade_db
    fi

    print_warning "Database restored. You may need to manually revert code changes."
    exit 1
}

# Main execution
main() {
    print_banner

    parse_args "$@"
    detect_deploy_mode

    echo -e "  ${YELLOW}Deployment Mode:${NC} $DEPLOY_MODE"
    echo -e "  ${YELLOW}Branch:${NC} $BRANCH"
    echo -e "  ${YELLOW}Project Dir:${NC} $PROJECT_DIR"
    echo -e "  ${YELLOW}Timestamp:${NC} $TIMESTAMP"

    if ! confirm "Proceed with deployment?"; then
        print_warning "Deployment cancelled"
        exit 0
    fi

    # Create log directory
    mkdir -p "$LOG_DIR" 2>/dev/null || true

    # Execute deployment steps
    create_backup

    pull_latest_code

    if [ "$DEPLOY_MODE" = "docker" ]; then
        deploy_docker
    else
        deploy_manual
    fi

    run_migrations

    # Verify deployment
    if ! run_healthcheck; then
        if confirm "Health check failed. Attempt rollback?"; then
            rollback
        fi
        exit 1
    fi

    cleanup_old_backups

    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Deployment completed successfully!              ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}\n"

    # Show quick status
    if [ -x "$SCRIPT_DIR/healthcheck.sh" ]; then
        "$SCRIPT_DIR/healthcheck.sh"
    fi
}

# Trap errors
trap 'print_error "An error occurred. Check logs for details."; exit 1' ERR

main "$@"
