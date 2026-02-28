#!/bin/bash
#
# SkillFade - One-Command Shared VPS Deployment
# Deploys alongside ucuzbot (or any project) that already holds ports 80/443
#
# What this does:
#   1. Moves existing project's nginx from ports 80/443 → localhost:8200
#   2. Installs host Nginx to handle both domains
#   3. Deploys SkillFade on localhost:8100 (API) + localhost:8101 (frontend)
#   4. Sets up SSL for SkillFade domain
#   5. Sets up SSL for ucuzbot domain (re-issues via host certbot)
#
# Usage:
#   ./scripts/setup-shared-vps.sh --domain skillfade.website --email you@email.com
#   ./scripts/setup-shared-vps.sh   # interactive mode
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
    echo "║      SkillFade - Shared VPS Deployment                    ║"
    echo "║   Deploy alongside existing web projects                  ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() { echo -e "\n${CYAN}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.shared.yml"

# Default values
DOMAIN=""
EMAIL=""
SKIP_SSL=false
UCUZBOT_DIR=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)      DOMAIN="$2"; shift 2 ;;
        --email)       EMAIL="$2"; shift 2 ;;
        --skip-ssl)    SKIP_SSL=true; shift ;;
        --ucuzbot-dir) UCUZBOT_DIR="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --domain DOMAIN       SkillFade domain (e.g. skillfade.website)"
            echo "  --email EMAIL         Email for SSL certificates"
            echo "  --ucuzbot-dir PATH    Path to ucuzbot project (auto-detected if not set)"
            echo "  --skip-ssl            Skip SSL certificate setup"
            echo "  -h, --help            Show this help"
            echo ""
            echo "Examples:"
            echo "  $0 --domain skillfade.website --email admin@example.com"
            echo "  $0   # interactive mode"
            exit 0
            ;;
        *) print_error "Unknown option: $1"; exit 1 ;;
    esac
done

# ─────────────────────────────────────────────────────────────────
# Step 1: Detect ucuzbot project
# ─────────────────────────────────────────────────────────────────
find_ucuzbot() {
    print_step "Looking for ucuzbot project..."

    if [ -n "$UCUZBOT_DIR" ] && [ -f "$UCUZBOT_DIR/docker-compose.yml" ]; then
        print_success "ucuzbot found at $UCUZBOT_DIR (provided via flag)"
        return 0
    fi

    # Search common locations
    for dir in /opt/ucuzbot /root/ucuzbot /home/*/ucuzbot; do
        if [ -f "$dir/docker-compose.yml" ] && [ -f "$dir/docker-compose.prod.yml" ]; then
            UCUZBOT_DIR="$dir"
            print_success "ucuzbot found at $UCUZBOT_DIR"
            return 0
        fi
    done

    # Search by running container name
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "ucuzbot"; then
        # Try to find project dir from container labels
        local container_dir
        container_dir=$(docker inspect --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$(docker ps -q --filter name=ucuzbot | head -1)" 2>/dev/null || true)
        if [ -n "$container_dir" ] && [ -f "$container_dir/docker-compose.yml" ]; then
            UCUZBOT_DIR="$container_dir"
            print_success "ucuzbot found at $UCUZBOT_DIR (from Docker labels)"
            return 0
        fi
    fi

    # Broader search
    local found
    found=$(find /opt /root /home -maxdepth 3 -name "docker-compose.prod.yml" -path "*/ucuzbot/*" 2>/dev/null | head -1)
    if [ -n "$found" ]; then
        UCUZBOT_DIR="$(dirname "$found")"
        print_success "ucuzbot found at $UCUZBOT_DIR"
        return 0
    fi

    print_warning "ucuzbot project not found automatically"
    read -p "Enter the path to ucuzbot project directory: " UCUZBOT_DIR
    if [ ! -f "$UCUZBOT_DIR/docker-compose.prod.yml" ]; then
        print_error "docker-compose.prod.yml not found in $UCUZBOT_DIR"
        exit 1
    fi
}

# ─────────────────────────────────────────────────────────────────
# Step 2: Ask for domain if not provided
# ─────────────────────────────────────────────────────────────────
ask_domain() {
    if [ -z "$DOMAIN" ]; then
        read -p "Enter SkillFade domain (e.g. skillfade.website): " DOMAIN
        if [ -z "$DOMAIN" ]; then
            print_error "Domain is required"
            exit 1
        fi
    fi

    if [ -z "$EMAIL" ] && [ "$SKIP_SSL" = false ]; then
        read -p "Enter email for SSL certificates: " EMAIL
    fi

    print_success "SkillFade domain: $DOMAIN"
}

# ─────────────────────────────────────────────────────────────────
# Step 3: Move ucuzbot's nginx off ports 80/443
# ─────────────────────────────────────────────────────────────────
reconfigure_ucuzbot() {
    print_step "Reconfiguring ucuzbot to free ports 80/443..."

    local prod_file="$UCUZBOT_DIR/docker-compose.prod.yml"

    # Backup the original
    if [ ! -f "${prod_file}.bak" ]; then
        cp "$prod_file" "${prod_file}.bak"
        print_success "Backed up original: docker-compose.prod.yml.bak"
    fi

    # Check if already reconfigured
    if grep -q "127.0.0.1:8200" "$prod_file" 2>/dev/null; then
        print_success "ucuzbot already reconfigured (ports 8200/8201)"
        return 0
    fi

    # Replace nginx ports: "80:80" → "127.0.0.1:8200:80", "443:443" → "127.0.0.1:8201:443"
    sed -i 's|"80:80"|"127.0.0.1:8200:80"|g' "$prod_file"
    sed -i 's|"443:443"|"127.0.0.1:8201:443"|g' "$prod_file"

    print_success "ucuzbot nginx ports changed to 127.0.0.1:8200 and 127.0.0.1:8201"

    # Restart ucuzbot with new ports
    print_step "Restarting ucuzbot with new port configuration..."
    cd "$UCUZBOT_DIR"
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down
    docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    cd "$PROJECT_DIR"

    # Wait for ucuzbot to come back
    sleep 10
    if curl -s http://127.0.0.1:8200 > /dev/null 2>&1; then
        print_success "ucuzbot is running on localhost:8200"
    else
        print_warning "ucuzbot may still be starting on localhost:8200..."
        sleep 10
    fi
}

# ─────────────────────────────────────────────────────────────────
# Step 4: Install host Nginx
# ─────────────────────────────────────────────────────────────────
install_nginx() {
    print_step "Setting up host Nginx..."

    if ! command -v nginx &> /dev/null; then
        sudo apt-get update -qq
        sudo apt-get install -y -qq nginx
        print_success "Nginx installed"
    else
        print_success "Nginx already installed"
    fi

    # Stop nginx first (will configure and start later)
    sudo systemctl stop nginx 2>/dev/null || true
    sudo systemctl enable nginx
}

# ─────────────────────────────────────────────────────────────────
# Step 5: Generate SkillFade .env
# ─────────────────────────────────────────────────────────────────
setup_env() {
    print_step "Setting up SkillFade environment..."

    if [ -f "$PROJECT_DIR/.env" ]; then
        print_warning ".env already exists - keeping it"
        return 0
    fi

    SECRET_KEY=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -hex 16)

    cat > "$PROJECT_DIR/.env" << EOF
# Auto-generated by setup-shared-vps.sh on $(date)

# Database
DATABASE_URL=postgresql://skillfade_user:${DB_PASSWORD}@db:5432/skillfade_db
DB_PASSWORD=${DB_PASSWORD}

# Security
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (configure later for alerts)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# Application
FRONTEND_URL=https://${DOMAIN}
BACKEND_URL=https://${DOMAIN}
DOMAIN=${DOMAIN}

# Alerts
ENABLE_ALERTS=true
MAX_ALERTS_PER_WEEK=1

# Environment
ENVIRONMENT=production
EOF

    chmod 600 "$PROJECT_DIR/.env"
    print_success ".env created with secure random keys"
}

# ─────────────────────────────────────────────────────────────────
# Step 6: Build and start SkillFade containers
# ─────────────────────────────────────────────────────────────────
start_containers() {
    print_step "Building and starting SkillFade containers..."

    cd "$PROJECT_DIR"
    mkdir -p backups

    docker compose -f "$COMPOSE_FILE" build
    docker compose -f "$COMPOSE_FILE" up -d

    print_step "Waiting for services to initialize..."
    sleep 15

    local retries=30
    while [ $retries -gt 0 ]; do
        if curl -s http://127.0.0.1:8100/health > /dev/null 2>&1; then
            break
        fi
        retries=$((retries - 1))
        echo -n "."
        sleep 2
    done
    echo ""

    if [ $retries -eq 0 ]; then
        print_warning "Backend still starting... (check: docker compose -f docker-compose.shared.yml logs -f backend)"
    else
        print_success "SkillFade backend healthy on localhost:8100"
    fi

    if curl -s http://127.0.0.1:8101 > /dev/null 2>&1; then
        print_success "SkillFade frontend healthy on localhost:8101"
    else
        print_warning "Frontend may still be starting..."
    fi
}

# ─────────────────────────────────────────────────────────────────
# Step 7: Configure host Nginx for BOTH projects
# ─────────────────────────────────────────────────────────────────
configure_nginx() {
    print_step "Configuring host Nginx for both projects..."

    sudo mkdir -p /var/www/certbot

    # Remove default site to avoid conflicts
    sudo rm -f /etc/nginx/sites-enabled/default

    # ── ucuzbot.az config ──
    sudo tee /etc/nginx/sites-available/ucuzbot > /dev/null << 'EOF'
server {
    listen 80;
    server_name ucuzbot.az www.ucuzbot.az;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:8200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
    }
}
EOF

    # ── skillfade config ──
    cat << SKILLFADE_EOF | sudo tee /etc/nginx/sites-available/skillfade > /dev/null
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /api {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8100/health;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8100/docs;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8100/openapi.json;
    }

    location / {
        proxy_pass http://127.0.0.1:8101;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
SKILLFADE_EOF

    # Enable both sites
    sudo ln -sf /etc/nginx/sites-available/ucuzbot /etc/nginx/sites-enabled/ucuzbot
    sudo ln -sf /etc/nginx/sites-available/skillfade /etc/nginx/sites-enabled/skillfade

    # Test and start (use restart to handle both fresh start and reload cases)
    if sudo nginx -t 2>&1; then
        sudo systemctl restart nginx
        print_success "Host Nginx started with both sites"
        print_success "  ucuzbot.az       → localhost:8200"
        print_success "  $DOMAIN → localhost:8100 + 8101"
    else
        print_error "Nginx config test failed!"
        sudo nginx -t
        exit 1
    fi
}

# ─────────────────────────────────────────────────────────────────
# Step 8: SSL for both domains
# ─────────────────────────────────────────────────────────────────
setup_ssl() {
    if [ "$SKIP_SSL" = true ] || [ -z "$EMAIL" ]; then
        print_warning "Skipping SSL setup"
        return 0
    fi

    # Install certbot
    if ! command -v certbot &> /dev/null; then
        print_step "Installing certbot..."
        sudo apt-get install -y -qq certbot python3-certbot-nginx
    fi

    # ── SSL for ucuzbot.az ──
    print_step "Obtaining SSL certificate for ucuzbot.az..."
    if sudo certbot certonly --webroot -w /var/www/certbot \
        --email "$EMAIL" --agree-tos --no-eff-email \
        -d ucuzbot.az -d www.ucuzbot.az 2>&1; then

        print_success "SSL certificate obtained for ucuzbot.az"

        sudo tee /etc/nginx/sites-available/ucuzbot > /dev/null << 'EOF'
server {
    listen 80;
    server_name ucuzbot.az www.ucuzbot.az;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name ucuzbot.az www.ucuzbot.az;

    ssl_certificate /etc/letsencrypt/live/ucuzbot.az/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ucuzbot.az/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
    }
}
EOF
        print_success "ucuzbot.az HTTPS enabled"
    else
        print_warning "SSL for ucuzbot.az failed - continuing with HTTP"
    fi

    # ── SSL for skillfade ──
    print_step "Obtaining SSL certificate for $DOMAIN..."
    if sudo certbot certonly --webroot -w /var/www/certbot \
        --email "$EMAIL" --agree-tos --no-eff-email \
        -d "$DOMAIN" 2>&1; then

        print_success "SSL certificate obtained for $DOMAIN"

        cat << SKILLFADE_SSL | sudo tee /etc/nginx/sites-available/skillfade > /dev/null
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location /api {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8100/health;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8100/docs;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8100/openapi.json;
    }

    location / {
        proxy_pass http://127.0.0.1:8101;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
SKILLFADE_SSL
        print_success "$DOMAIN HTTPS enabled"
    else
        print_warning "SSL for $DOMAIN failed - site will work on HTTP"
        print_warning "Make sure DNS points to this server, then run: sudo certbot --nginx -d $DOMAIN"
    fi

    # Reload nginx with SSL configs
    sudo nginx -t && sudo systemctl restart nginx
    print_success "Nginx reloaded with SSL"

    # Auto-renewal cron
    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
        print_success "SSL auto-renewal cron added"
    fi
}

# ─────────────────────────────────────────────────────────────────
# Step 9: Backup cron for SkillFade
# ─────────────────────────────────────────────────────────────────
setup_backup_cron() {
    print_step "Setting up daily backup..."

    if ! crontab -l 2>/dev/null | grep -q "skillfade.*backup"; then
        (crontab -l 2>/dev/null; echo "0 2 * * * cd $PROJECT_DIR && docker exec skillfade_db pg_dump -U skillfade_user skillfade_db | gzip > $PROJECT_DIR/backups/daily_\$(date +\%Y\%m\%d).sql.gz && find $PROJECT_DIR/backups -name 'daily_*.sql.gz' -mtime +30 -delete") | crontab -
        print_success "Daily backup cron added (2 AM, 30-day retention)"
    else
        print_success "Backup cron already exists"
    fi
}

# ─────────────────────────────────────────────────────────────────
# Step 10: Firewall
# ─────────────────────────────────────────────────────────────────
setup_firewall() {
    print_step "Checking firewall..."

    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp  > /dev/null 2>&1 || true
        sudo ufw allow 80/tcp  > /dev/null 2>&1 || true
        sudo ufw allow 443/tcp > /dev/null 2>&1 || true
        print_success "Firewall rules set (22, 80, 443)"
    fi
}

# ─────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║      Both Projects Deployed Successfully!                ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Architecture:${NC}"
    echo "  Internet → Host Nginx (80/443)"
    echo "              ├── ucuzbot.az       → localhost:8200 (ucuzbot docker nginx)"
    echo "              └── $DOMAIN → localhost:8100 (API) + 8101 (frontend)"
    echo ""
    echo -e "${YELLOW}SkillFade:${NC}"
    echo -e "  ${CYAN}URL:${NC}         https://$DOMAIN"
    echo -e "  ${CYAN}Health:${NC}      https://$DOMAIN/health"
    echo -e "  ${CYAN}API Docs:${NC}    https://$DOMAIN/docs"
    echo ""
    echo -e "${YELLOW}SkillFade Commands:${NC}"
    echo "  Logs:      cd $PROJECT_DIR && docker compose -f docker-compose.shared.yml logs -f"
    echo "  Stop:      cd $PROJECT_DIR && docker compose -f docker-compose.shared.yml down"
    echo "  Restart:   cd $PROJECT_DIR && docker compose -f docker-compose.shared.yml restart"
    echo "  Rebuild:   cd $PROJECT_DIR && docker compose -f docker-compose.shared.yml up -d --build"
    echo ""
    echo -e "${YELLOW}ucuzbot Commands:${NC}"
    echo "  Logs:      cd $UCUZBOT_DIR && docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
    echo "  Restart:   cd $UCUZBOT_DIR && docker compose -f docker-compose.yml -f docker-compose.prod.yml restart"
    echo ""
    echo -e "${YELLOW}Nginx:${NC}"
    echo "  Config:    /etc/nginx/sites-available/skillfade"
    echo "  Config:    /etc/nginx/sites-available/ucuzbot"
    echo "  Test:      sudo nginx -t"
    echo "  Reload:    sudo systemctl reload nginx"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Point DNS A record for $DOMAIN to this server's IP"
    echo "  2. Register at https://$DOMAIN"
    echo "  3. Make yourself admin:"
    echo "     docker exec skillfade_backend python grant_admin.py your@email.com"
    echo ""
}

# ─────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────
main() {
    print_banner

    if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
        print_warning "This script needs sudo privileges"
    fi

    ask_domain
    find_ucuzbot
    reconfigure_ucuzbot
    install_nginx
    setup_env
    start_containers
    configure_nginx
    setup_ssl
    setup_backup_cron
    setup_firewall
    print_summary
}

main "$@"
