#!/bin/bash
#
# SkillFade First-Time VPS Setup Script
# Run this once to set up everything automatically
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║         SkillFade VPS Setup Script                        ║"
    echo "║     Automated first-time deployment                       ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() { echo -e "\n${CYAN}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if Docker is installed
check_docker() {
    print_step "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Installing..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installed"
        print_warning "You may need to log out and back in for Docker permissions"
    else
        print_success "Docker is installed"
    fi

    # Check Docker Compose
    if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
        print_warning "Docker Compose not found. Installing..."
        sudo apt-get update
        sudo apt-get install -y docker-compose-plugin
        print_success "Docker Compose installed"
    else
        print_success "Docker Compose is installed"
    fi
}

# Create .env file
setup_env() {
    print_step "Setting up environment configuration..."

    if [ -f "$PROJECT_DIR/.env" ]; then
        print_warning ".env file already exists"
        read -p "Overwrite? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_success "Keeping existing .env"
            return 0
        fi
    fi

    # Generate secrets
    SECRET_KEY=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -hex 16)

    # Get domain (optional)
    read -p "Enter your domain (press Enter for localhost): " DOMAIN
    DOMAIN=${DOMAIN:-localhost}

    if [ "$DOMAIN" = "localhost" ]; then
        FRONTEND_URL="http://localhost"
        BACKEND_URL="http://localhost"
    else
        FRONTEND_URL="https://$DOMAIN"
        BACKEND_URL="https://$DOMAIN"
    fi

    # Create .env
    cat > "$PROJECT_DIR/.env" << EOF
# Database Configuration (auto-generated)
DATABASE_URL=postgresql://skillfade_user:${DB_PASSWORD}@db:5432/skillfade_db
DB_PASSWORD=${DB_PASSWORD}

# Security (auto-generated)
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email Configuration (optional - configure later for alerts)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Application Settings
FRONTEND_URL=${FRONTEND_URL}
BACKEND_URL=${BACKEND_URL}
DOMAIN=${DOMAIN}

# Alert Settings
ENABLE_ALERTS=true
MAX_ALERTS_PER_WEEK=1

# Environment
ENVIRONMENT=production
EOF

    chmod 600 "$PROJECT_DIR/.env"
    print_success "Environment file created with secure random keys"
}

# Create required directories
setup_directories() {
    print_step "Creating required directories..."

    mkdir -p "$PROJECT_DIR/certbot/conf"
    mkdir -p "$PROJECT_DIR/certbot/www"
    mkdir -p "$PROJECT_DIR/backups"
    mkdir -p /var/log/skillfade 2>/dev/null || sudo mkdir -p /var/log/skillfade

    print_success "Directories created"
}

# Build and start containers
start_services() {
    print_step "Building and starting services..."

    cd "$PROJECT_DIR"

    # Detect docker compose command
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi

    print_step "Building containers (this may take a few minutes)..."
    $COMPOSE_CMD -f docker-compose.prod.yml build

    print_step "Starting containers..."
    $COMPOSE_CMD -f docker-compose.prod.yml up -d

    print_step "Waiting for services to initialize..."
    sleep 15

    print_success "Services started"
}

# Check health
verify_deployment() {
    print_step "Verifying deployment..."

    local retries=30
    while [ $retries -gt 0 ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null | grep -q "200"; then
            print_success "Health check passed!"
            return 0
        fi
        retries=$((retries - 1))
        echo -n "."
        sleep 2
    done

    print_warning "Health check not responding yet - services may still be starting"
    return 1
}

# Setup SSL (optional)
setup_ssl() {
    source "$PROJECT_DIR/.env"

    if [ "$DOMAIN" = "localhost" ] || [ -z "$DOMAIN" ]; then
        print_warning "Skipping SSL setup (no domain configured)"
        return 0
    fi

    print_step "Setting up SSL certificate for $DOMAIN..."

    read -p "Set up SSL certificate now? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipping SSL setup"
        return 0
    fi

    read -p "Enter email for SSL certificate: " SSL_EMAIL

    docker run --rm \
        -v "$PROJECT_DIR/certbot/conf:/etc/letsencrypt" \
        -v "$PROJECT_DIR/certbot/www:/var/www/certbot" \
        certbot/certbot certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d "$DOMAIN"

    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained!"
        print_warning "To enable HTTPS, update nginx/default.conf with SSL configuration"
    else
        print_warning "SSL setup failed - you can try again later"
    fi
}

# Print summary
print_summary() {
    source "$PROJECT_DIR/.env"

    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         Setup Complete!                                   ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}\n"

    echo -e "${YELLOW}Your SkillFade instance is now running!${NC}\n"

    if [ "$DOMAIN" = "localhost" ]; then
        echo -e "  ${CYAN}Access URL:${NC} http://localhost"
    else
        echo -e "  ${CYAN}Access URL:${NC} http://$DOMAIN"
    fi

    echo -e "  ${CYAN}API Health:${NC} http://localhost/health"
    echo -e "  ${CYAN}API Docs:${NC}   http://localhost/docs"

    echo -e "\n${YELLOW}Useful Commands:${NC}"
    echo "  View logs:     docker compose -f docker-compose.prod.yml logs -f"
    echo "  Stop:          docker compose -f docker-compose.prod.yml down"
    echo "  Restart:       docker compose -f docker-compose.prod.yml restart"
    echo "  Update:        ./scripts/deploy.sh"
    echo "  Backup:        ./scripts/backup.sh"
    echo "  Health check:  ./scripts/healthcheck.sh"

    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "  1. Register your first user at the web interface"
    echo "  2. Make yourself admin: docker exec skillfade_backend python scripts/grant_admin.py your-email@example.com"
    echo "  3. Configure SMTP in .env for email alerts (optional)"
    echo "  4. Set up SSL if using a domain (run this script again)"
    echo ""
}

# Main
main() {
    print_banner

    cd "$PROJECT_DIR"

    check_docker
    setup_env
    setup_directories
    start_services
    verify_deployment
    setup_ssl
    print_summary
}

main "$@"
