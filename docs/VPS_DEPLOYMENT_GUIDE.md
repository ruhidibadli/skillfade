# SkillFade VPS Deployment Guide

Deploy SkillFade on a VPS with a single command.

---

## Quick Start (Recommended)

### Prerequisites
- Ubuntu 22.04 or 24.04 VPS (1GB RAM minimum)
- SSH access to your VPS

### Step 1: Connect to VPS

```bash
ssh root@your-server-ip
```

### Step 2: Clone Repository

```bash
cd /opt
git clone <your-repository-url> skillfade
cd skillfade
```

### Step 3: Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

That's it! The script will:
- Install Docker if needed
- Generate secure secrets automatically
- Build and start all containers
- Verify the deployment

### Step 4: Create Admin User

1. Visit your site and register a user
2. Make yourself admin:
```bash
docker exec skillfade_backend python grant_admin.py your-email@example.com
```

---

## Common Commands

| Action | Command |
|--------|---------|
| View logs | `docker compose -f docker-compose.prod.yml logs -f` |
| Stop | `docker compose -f docker-compose.prod.yml down` |
| Start | `docker compose -f docker-compose.prod.yml up -d` |
| Restart | `docker compose -f docker-compose.prod.yml restart` |
| Update | `./scripts/deploy.sh` |
| Backup | `./scripts/backup.sh` |
| Health check | `./scripts/healthcheck.sh` |

---

## Updating the Application

```bash
cd /opt/skillfade
./scripts/deploy.sh
```

Or with options:
```bash
./scripts/deploy.sh --force          # No confirmation prompts
./scripts/deploy.sh -b develop       # Deploy specific branch
./scripts/deploy.sh --skip-backup    # Skip backup (not recommended)
```

---

## SSL/HTTPS Setup

If you have a domain:

```bash
# 1. Run the SSL setup
docker run --rm \
    -v /opt/skillfade/certbot/conf:/etc/letsencrypt \
    -v /opt/skillfade/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d yourdomain.com

# 2. Update nginx config to enable HTTPS
nano nginx/default.conf

# 3. Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### SSL Nginx Configuration

Replace the server block in `nginx/default.conf`:

```nginx
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://backend:8000/health;
    }

    location /docs {
        proxy_pass http://backend:8000/docs;
    }

    location /openapi.json {
        proxy_pass http://backend:8000/openapi.json;
    }

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Email Alerts Configuration

Edit `.env` file:
```bash
nano .env
```

Add SMTP settings:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

Restart backend:
```bash
docker compose -f docker-compose.prod.yml restart backend
```

---

## Backup & Restore

### Create Backup
```bash
./scripts/backup.sh
```

### Scheduled Backups
```bash
crontab -e
```
Add:
```cron
0 2 * * * /opt/skillfade/scripts/backup.sh
```

### Restore
```bash
gunzip -c backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | \
    docker exec -i skillfade_db psql -U skillfade_user skillfade_db
```

---

## Firewall Setup

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Troubleshooting

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Rebuild After Code Changes
```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Database Access
```bash
docker exec -it skillfade_db psql -U skillfade_user skillfade_db
```

### Check Health
```bash
curl http://localhost/health
./scripts/healthcheck.sh
```

---

## VPS Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 1 GB | 2 GB |
| CPU | 1 vCPU | 2 vCPU |
| Storage | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 | Ubuntu 24.04 |

---

**Last Updated:** 2026-01-14
