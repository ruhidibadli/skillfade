# SkillFade VPS Deployment Guide

Complete step-by-step guide to deploy SkillFade on a VPS (Virtual Private Server).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Option 1: Docker Deployment (Recommended)](#option-1-docker-deployment-recommended)
4. [Option 2: Manual Deployment](#option-2-manual-deployment)
5. [Nginx Reverse Proxy Configuration](#nginx-reverse-proxy-configuration)
6. [SSL/HTTPS Setup with Let's Encrypt](#sslhttps-setup-with-lets-encrypt)
7. [Domain Configuration](#domain-configuration)
8. [Alert System (Cron Jobs)](#alert-system-cron-jobs)
9. [Backup Strategy](#backup-strategy)
10. [Monitoring & Logging](#monitoring--logging)
11. [Security Hardening](#security-hardening)
12. [Updating the Application](#updating-the-application)
13. [Troubleshooting](#troubleshooting)
14. [Quick Reference Commands](#quick-reference-commands)

---

## Prerequisites

### VPS Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 1 GB | 2 GB |
| CPU | 1 vCPU | 2 vCPU |
| Storage | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Required Access
- SSH access to your VPS (root or sudo user)
- Domain name (optional but recommended)
- SMTP credentials for email alerts (optional)

### Local Requirements
- Git installed locally
- SSH client

---

## VPS Initial Setup

### 1. Connect to Your VPS

```bash
ssh root@your-server-ip
```

### 2. Create Non-Root User

```bash
# Create user
adduser skillfade

# Add to sudo group
usermod -aG sudo skillfade

# Switch to new user
su - skillfade
```

### 3. Configure SSH Key Authentication (Recommended)

On your local machine:
```bash
# Generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy key to server
ssh-copy-id skillfade@your-server-ip
```

### 4. Secure SSH (Optional but Recommended)

```bash
sudo nano /etc/ssh/sshd_config
```

Update these settings:
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 5. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 6. Configure Firewall

```bash
# Install UFW if not present
sudo apt install ufw -y

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 7. Set Timezone

```bash
sudo timedatectl set-timezone UTC
```

---

## Option 1: Docker Deployment (Recommended)

This is the simplest and most reliable deployment method.

### 1. Install Docker

```bash
# Install dependencies
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or logout/login)
newgrp docker

# Verify installation
docker --version
```

### 2. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. Clone the Repository

```bash
# Create application directory
sudo mkdir -p /opt/skillfade
sudo chown $USER:$USER /opt/skillfade
cd /opt/skillfade

# Clone repository
git clone <your-repository-url> .
```

### 4. Create Production Environment File

```bash
cp .env.example .env
nano .env
```

Update with production values:
```bash
# Database Configuration
DATABASE_URL=postgresql://skillfade_user:YOUR_STRONG_PASSWORD_HERE@db:5432/skillfade_db

# Security - GENERATE NEW KEY!
# Run: openssl rand -hex 32
SECRET_KEY=your_generated_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email Configuration (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Application Settings
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com

# Alert Settings
ENABLE_ALERTS=true
MAX_ALERTS_PER_WEEK=1

# Environment
ENVIRONMENT=production
```

### 5. Create Production Docker Compose File

Create `docker-compose.prod.yml`:
```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: skillfade_db
    restart: always
    environment:
      POSTGRES_DB: skillfade_db
      POSTGRES_USER: skillfade_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U skillfade_user -d skillfade_db"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - skillfade_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: skillfade_backend
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://skillfade_user:${DB_PASSWORD:-changeme}@db:5432/skillfade_db
      SECRET_KEY: ${SECRET_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM: ${SMTP_FROM}
      FRONTEND_URL: ${FRONTEND_URL}
      ENVIRONMENT: production
    expose:
      - "8000"
    networks:
      - skillfade_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: /api
    container_name: skillfade_frontend
    restart: always
    depends_on:
      - backend
    expose:
      - "80"
    networks:
      - skillfade_network

  nginx:
    image: nginx:alpine
    container_name: skillfade_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - skillfade_network

  certbot:
    image: certbot/certbot
    container_name: skillfade_certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - skillfade_network

volumes:
  postgres_data:

networks:
  skillfade_network:
    driver: bridge
```

### 6. Create Production Dockerfiles

Create `backend/Dockerfile.prod`:
```bash
nano backend/Dockerfile.prod
```

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Run migrations and start server with Gunicorn
CMD alembic upgrade head && gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Create `frontend/Dockerfile.prod`:
```bash
nano frontend/Dockerfile.prod
```

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:
```bash
nano frontend/nginx.conf
```

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
        proxy_cache_revalidate on;
        expires off;
        access_log off;
    }
}
```

### 7. Create Nginx Configuration

```bash
mkdir -p nginx/conf.d
nano nginx/nginx.conf
```

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip Settings
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
}
```

Create the main site configuration:
```bash
nano nginx/conf.d/default.conf
```

```nginx
# Upstream definitions
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:80;
}

# HTTP - redirect to HTTPS (uncomment after SSL setup)
# server {
#     listen 80;
#     server_name yourdomain.com;
#
#     location /.well-known/acme-challenge/ {
#         root /var/www/certbot;
#     }
#
#     location / {
#         return 301 https://$host$request_uri;
#     }
# }

# Main server block (HTTP for initial setup, switch to HTTPS after)
server {
    listen 80;
    server_name yourdomain.com localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # API proxy
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API docs
    location /docs {
        proxy_pass http://backend/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /openapi.json {
        proxy_pass http://backend/openapi.json;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS server block (uncomment after SSL setup)
# server {
#     listen 443 ssl http2;
#     server_name yourdomain.com;
#
#     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
#
#     ssl_session_timeout 1d;
#     ssl_session_cache shared:SSL:50m;
#     ssl_session_tickets off;
#
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#
#     add_header Strict-Transport-Security "max-age=63072000" always;
#
#     # ... rest of location blocks same as HTTP ...
# }
```

### 8. Add Database Password to Environment

```bash
# Add DB_PASSWORD to .env
echo "DB_PASSWORD=$(openssl rand -hex 16)" >> .env
```

### 9. Create Certbot Directories

```bash
mkdir -p certbot/conf certbot/www
```

### 10. Build and Start Services

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 11. Verify Deployment

```bash
# Check health endpoint
curl http://localhost/health

# Check frontend
curl http://localhost
```

---

## Option 2: Manual Deployment

For those who prefer not to use Docker.

### 1. Install System Dependencies

```bash
sudo apt update
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    python3-pip \
    postgresql \
    postgresql-contrib \
    nginx \
    nodejs \
    npm \
    git \
    supervisor
```

Install Node.js 18+ if not available:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Setup PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE skillfade_db;
CREATE USER skillfade_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE skillfade_db TO skillfade_user;
ALTER DATABASE skillfade_db OWNER TO skillfade_user;
\c skillfade_db
GRANT ALL ON SCHEMA public TO skillfade_user;
EOF
```

### 3. Clone Repository

```bash
sudo mkdir -p /opt/skillfade
sudo chown $USER:$USER /opt/skillfade
cd /opt/skillfade
git clone <your-repository-url> .
```

### 4. Setup Backend

```bash
cd /opt/skillfade/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Create environment file
cp ../.env.example ../.env
nano ../.env
```

Update `.env`:
```bash
DATABASE_URL=postgresql://skillfade_user:your_strong_password@localhost:5432/skillfade_db
SECRET_KEY=your_generated_secret_key_here
FRONTEND_URL=https://yourdomain.com
ENVIRONMENT=production
```

Run migrations:
```bash
alembic upgrade head
```

### 5. Setup Frontend

```bash
cd /opt/skillfade/frontend

# Install dependencies
npm ci

# Create production environment file
echo "VITE_API_URL=/api" > .env.production

# Build for production
npm run build
```

### 6. Configure Supervisor (Process Manager)

Create backend service:
```bash
sudo nano /etc/supervisor/conf.d/skillfade-backend.conf
```

```ini
[program:skillfade-backend]
command=/opt/skillfade/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
directory=/opt/skillfade/backend
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/skillfade/backend.err.log
stdout_logfile=/var/log/skillfade/backend.out.log
environment=PATH="/opt/skillfade/backend/venv/bin"
```

Create log directory and update supervisor:
```bash
sudo mkdir -p /var/log/skillfade
sudo chown www-data:www-data /var/log/skillfade

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start skillfade-backend
```

### 7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/skillfade
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend static files
    location / {
        root /opt/skillfade/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Service worker - no cache
    location /sw.js {
        root /opt/skillfade/frontend/dist;
        add_header Cache-Control "no-cache";
        expires off;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }

    # API docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/skillfade /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/HTTPS Setup with Let's Encrypt

### For Docker Deployment

1. **Initial SSL Certificate**

First, temporarily allow HTTP for certificate verification:
```bash
# Get certificate
docker run --rm \
    -v /opt/skillfade/certbot/conf:/etc/letsencrypt \
    -v /opt/skillfade/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d yourdomain.com
```

2. **Update Nginx Configuration**

Edit `nginx/conf.d/default.conf`:
- Uncomment the HTTPS server block
- Uncomment the HTTP to HTTPS redirect
- Update domain name in SSL paths
- Comment out the HTTP server block's main location directives

3. **Restart Nginx**
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

### For Manual Deployment

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Domain Configuration

### DNS Records

Add these DNS records at your domain registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your-server-ip | 300 |
| A | www | your-server-ip | 300 |
| CNAME | www | yourdomain.com | 300 |

### Verify DNS Propagation

```bash
# Check A record
dig +short yourdomain.com

# Check from multiple locations
nslookup yourdomain.com 8.8.8.8
```

---

## Alert System (Cron Jobs)

### For Docker Deployment

```bash
# Add cron job to host system
crontab -e
```

Add:
```cron
# SkillFade alerts - daily at 9 AM UTC
0 9 * * * docker exec skillfade_backend python run_alerts.py >> /var/log/skillfade/alerts.log 2>&1
```

### For Manual Deployment

```bash
crontab -e
```

Add:
```cron
# SkillFade alerts - daily at 9 AM UTC
0 9 * * * cd /opt/skillfade/backend && /opt/skillfade/backend/venv/bin/python run_alerts.py >> /var/log/skillfade/alerts.log 2>&1
```

### Verify Cron

```bash
# List cron jobs
crontab -l

# Check cron logs
sudo tail -f /var/log/syslog | grep CRON
```

---

## Backup Strategy

### Database Backup Script

The project includes a backup script at `scripts/backup.sh`.

```bash
# Make executable (first time)
chmod +x /opt/skillfade/scripts/backup.sh

# Run manual backup
./scripts/backup.sh

# Custom backup directory
BACKUP_DIR=/custom/path ./scripts/backup.sh

# Custom retention (days)
RETENTION_DAYS=60 ./scripts/backup.sh
```

**What it does:**
- Detects Docker or manual deployment automatically
- Creates compressed SQL backup
- Removes backups older than retention period (default: 30 days)
- Shows backup summary

**Schedule automatic backups:**
```bash
crontab -e
```

Add:
```cron
# Database backup - daily at 2 AM
0 2 * * * /opt/skillfade/scripts/backup.sh >> /var/log/skillfade/backup.log 2>&1
```

### Restore from Backup

```bash
# For Docker
gunzip -c /opt/skillfade/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i skillfade_db psql -U skillfade_user skillfade_db

# For manual
gunzip -c /opt/skillfade/backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | PGPASSWORD="your_db_password" psql -h localhost -U skillfade_user skillfade_db
```

### Backup to Remote Storage (Optional)

Install and configure rclone for cloud backup:
```bash
# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure (follow prompts for your cloud provider)
rclone config

# Add to backup script
rclone copy "$BACKUP_DIR/db_backup_$DATE.sql.gz" remote:skillfade-backups/
```

---

## Monitoring & Logging

### Health Check Script

The project includes a comprehensive health check script at `scripts/healthcheck.sh`.

```bash
# Make executable (first time)
chmod +x /opt/skillfade/scripts/healthcheck.sh

# Run full health check (shows detailed status)
./scripts/healthcheck.sh

# Quiet mode (just returns exit code, good for cron)
./scripts/healthcheck.sh -q
```

**What it checks:**
- Docker containers status (if using Docker)
- System services (PostgreSQL, Nginx, Supervisor)
- HTTP endpoints (health API, frontend)
- Database connectivity
- Disk space usage
- Memory usage

**Schedule automatic health checks:**
```bash
crontab -e
```

```cron
# Health check every 5 minutes
*/5 * * * * /opt/skillfade/scripts/healthcheck.sh -q || echo "SkillFade health check failed at $(date)" >> /var/log/skillfade/healthcheck.log
```

**Health check with email alerts:**
```cron
# Health check with email notification on failure
*/5 * * * * /opt/skillfade/scripts/healthcheck.sh -q || echo "SkillFade health check failed at $(date)" | mail -s "SkillFade Alert: Service Down" your-email@example.com
```

### View Logs

**Docker:**
```bash
# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

**Manual:**
```bash
# Backend logs
sudo tail -f /var/log/skillfade/backend.out.log
sudo tail -f /var/log/skillfade/backend.err.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Log Rotation

Create `/etc/logrotate.d/skillfade`:
```bash
sudo nano /etc/logrotate.d/skillfade
```

```
/var/log/skillfade/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

---

## Security Hardening

### 1. Fail2ban (Protect Against Brute Force)

```bash
sudo apt install fail2ban -y

# Create local configuration
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Automatic Security Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Additional Nginx Security Headers

Add to server block:
```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'" always;

# Permissions Policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

### 4. Rate Limiting

Add to Nginx http block:
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;
```

Apply to locations:
```nginx
location /api/auth/login {
    limit_req zone=login_limit burst=5 nodelay;
    # ... proxy settings
}

location /api {
    limit_req zone=api_limit burst=20 nodelay;
    # ... proxy settings
}
```

---

## Updating the Application

### Using the Deploy Script (Recommended)

The project includes an automated deployment script that handles the entire update process.

```bash
cd /opt/skillfade

# Make script executable (first time only)
chmod +x scripts/deploy.sh scripts/healthcheck.sh scripts/backup.sh

# Standard deployment
./scripts/deploy.sh

# Deploy specific branch
./scripts/deploy.sh -b develop

# Deploy without confirmation prompts
./scripts/deploy.sh --force

# Skip backup (not recommended)
./scripts/deploy.sh --skip-backup

# See all options
./scripts/deploy.sh --help
```

**What the deploy script does:**
1. Creates database backup (rollback point)
2. Pulls latest code from git
3. Builds Docker images or installs dependencies
4. Runs database migrations
5. Restarts services
6. Runs health check to verify deployment
7. Cleans up old backups

### Manual Docker Update Process

```bash
cd /opt/skillfade

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec skillfade_backend alembic upgrade head

# Verify
docker-compose -f docker-compose.prod.yml ps
curl http://localhost/health
```

### Manual Update Process (No Docker)

```bash
cd /opt/skillfade

# Pull latest changes
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
deactivate

# Update frontend
cd ../frontend
npm ci
npm run build

# Restart services
sudo supervisorctl restart skillfade-backend
sudo systemctl reload nginx

# Verify
curl http://localhost/health
```

### Zero-Downtime Update (Docker)

```bash
# Build new images without stopping
docker-compose -f docker-compose.prod.yml build

# Update services one by one
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend

# Run migrations
docker exec skillfade_backend alembic upgrade head
```

---

## Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway

**Cause:** Backend not running or not accessible

**Solutions:**
```bash
# Docker
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs backend

# Manual
sudo supervisorctl status skillfade-backend
sudo tail -f /var/log/skillfade/backend.err.log
```

#### 2. Database Connection Error

**Cause:** PostgreSQL not running or wrong credentials

**Solutions:**
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Docker - check db container
docker-compose -f docker-compose.prod.yml logs db

# Test connection
psql -h localhost -U skillfade_user -d skillfade_db
```

#### 3. Frontend Shows Blank Page

**Cause:** Build failed or routing issues

**Solutions:**
```bash
# Rebuild frontend
cd /opt/skillfade/frontend
npm run build

# Check browser console for errors
# Check Nginx configuration
sudo nginx -t
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Docker - rebuild nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

#### 5. Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /opt/skillfade

# Fix permissions
sudo chmod -R 755 /opt/skillfade
```

#### 6. Out of Memory

```bash
# Check memory
free -h

# Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Quick Reference Commands

### Deployment Scripts

| Action | Command |
|--------|---------|
| Full deployment | `./scripts/deploy.sh` |
| Deploy specific branch | `./scripts/deploy.sh -b develop` |
| Deploy without prompts | `./scripts/deploy.sh --force` |
| Health check (detailed) | `./scripts/healthcheck.sh` |
| Health check (quiet) | `./scripts/healthcheck.sh -q` |
| Create backup | `./scripts/backup.sh` |
| View deploy options | `./scripts/deploy.sh --help` |

### Docker Deployment

| Action | Command |
|--------|---------|
| Start all services | `docker-compose -f docker-compose.prod.yml up -d` |
| Stop all services | `docker-compose -f docker-compose.prod.yml down` |
| Restart all services | `docker-compose -f docker-compose.prod.yml restart` |
| View logs | `docker-compose -f docker-compose.prod.yml logs -f` |
| Backend shell | `docker exec -it skillfade_backend bash` |
| Database shell | `docker exec -it skillfade_db psql -U skillfade_user skillfade_db` |
| Run migrations | `docker exec skillfade_backend alembic upgrade head` |
| Check health | `curl http://localhost/health` |
| Rebuild | `docker-compose -f docker-compose.prod.yml build --no-cache` |

### Manual Deployment

| Action | Command |
|--------|---------|
| Start backend | `sudo supervisorctl start skillfade-backend` |
| Stop backend | `sudo supervisorctl stop skillfade-backend` |
| Restart backend | `sudo supervisorctl restart skillfade-backend` |
| Backend status | `sudo supervisorctl status` |
| View backend logs | `sudo tail -f /var/log/skillfade/backend.out.log` |
| Nginx reload | `sudo systemctl reload nginx` |
| Nginx restart | `sudo systemctl restart nginx` |
| Check health | `curl http://localhost/health` |
| Run migrations | `cd /opt/skillfade/backend && source venv/bin/activate && alembic upgrade head` |

### Useful Diagnostics

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check open ports
sudo netstat -tlnp

# Check firewall
sudo ufw status

# Check SSL certificate
sudo certbot certificates

# Test Nginx config
sudo nginx -t
```

---

## Post-Deployment Checklist

- [ ] VPS firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Application running and accessible
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Health check endpoint responding
- [ ] Cron jobs configured (alerts, backups)
- [ ] Log rotation configured
- [ ] Fail2ban installed and running
- [ ] Backup script tested
- [ ] Monitoring/alerting set up
- [ ] Environment variables secured
- [ ] Application tested end-to-end

---

**Last Updated:** 2026-01-12
