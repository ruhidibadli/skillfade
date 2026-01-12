# Deployment Guide

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or SQLite for single user)
- Domain name (optional)
- SMTP credentials for email alerts (optional)

## Option 1: Docker Compose (Recommended)

This is the simplest deployment method.

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd learning-decay-tracker
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env with your settings**
   ```bash
   nano .env
   ```

   Required settings:
   - `SECRET_KEY`: Generate with `openssl rand -hex 32`
   - `DB_PASSWORD`: Your database password
   - `SMTP_*`: Email settings (optional but recommended)

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Run migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Updating

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

## Option 2: Manual Deployment

### Backend Setup

1. **Install system dependencies**
   ```bash
   sudo apt update
   sudo apt install python3.11 python3.11-venv postgresql nginx
   ```

2. **Create database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE learning_tracker;
   CREATE USER tracker_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE learning_tracker TO tracker_user;
   \q
   ```

3. **Set up application**
   ```bash
   cd backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp ../.env.example ../.env
   nano ../.env
   ```

5. **Run migrations**
   ```bash
   alembic upgrade head
   ```

6. **Create systemd service**
   ```bash
   sudo nano /etc/systemd/system/learning-tracker-api.service
   ```

   ```ini
   [Unit]
   Description=Learning Tracker API
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/learning-tracker/backend
   Environment="PATH=/path/to/learning-tracker/backend/venv/bin"
   ExecStart=/path/to/learning-tracker/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable learning-tracker-api
   sudo systemctl start learning-tracker-api
   ```

### Frontend Setup

1. **Build frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/learning-tracker
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/learning-tracker/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/learning-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### SSL Certificate (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Alert System Setup

The alert system requires a scheduled job to check and send alerts.

### Using Cron

1. **Create alert script**
   ```bash
   nano /path/to/learning-tracker/backend/run_alerts.py
   ```

   ```python
   from app.core.database import SessionLocal
   from app.services.alerts import process_all_alerts

   if __name__ == "__main__":
       db = SessionLocal()
       try:
           process_all_alerts(db)
       finally:
           db.close()
   ```

2. **Add to crontab**
   ```bash
   crontab -e
   ```

   ```
   # Run alerts daily at 9 AM
   0 9 * * * cd /path/to/learning-tracker/backend && /path/to/venv/bin/python run_alerts.py
   ```

## Backup Strategy

### Database Backup

```bash
# Create backup script
nano /path/to/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
pg_dump learning_tracker > "$BACKUP_DIR/backup_$DATE.sql"
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

```bash
chmod +x /path/to/backup.sh
# Add to crontab for daily backups
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Check Service Status

```bash
# Docker
docker-compose ps
docker-compose logs -f

# Manual
sudo systemctl status learning-tracker-api
sudo tail -f /var/log/nginx/access.log
```

### Health Check Endpoint

```bash
curl http://localhost:8000/health
```

## Troubleshooting

### Backend won't start
- Check logs: `docker-compose logs backend` or `sudo journalctl -u learning-tracker-api`
- Verify database connection in .env
- Ensure migrations are up to date: `alembic upgrade head`

### Frontend shows blank page
- Check browser console for errors
- Verify API URL in frontend/.env
- Rebuild frontend: `npm run build`

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection string in .env
- Verify database user permissions

### Email alerts not working
- Verify SMTP credentials in .env
- Check if port 587 is open
- Test with a simple Python SMTP script
- Check spam folder

## Security Recommendations

1. **Use strong passwords**
   - Database password
   - JWT secret key
   - Email credentials

2. **Keep software updated**
   ```bash
   sudo apt update && sudo apt upgrade
   pip install --upgrade -r requirements.txt
   npm update
   ```

3. **Firewall configuration**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

4. **Limit database access**
   - Don't expose PostgreSQL port externally
   - Use strong database passwords
   - Regular backups

5. **HTTPS only**
   - Always use SSL certificates in production
   - Redirect HTTP to HTTPS
