# Quick Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- OR Python 3.11+ and Node.js 18+ (for manual setup)

## Option 1: Docker Setup (Recommended)

1. **Clone or navigate to the project**
   ```bash
   cd d:\skillfade
   ```

2. **Create environment file**
   ```bash
   copy .env.example .env
   ```

3. **Generate a secret key**
   ```bash
   # On Windows (PowerShell):
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

   # On Linux/Mac:
   openssl rand -hex 32
   ```

4. **Edit .env file**
   Open `.env` in a text editor and set:
   - `SECRET_KEY` to the generated value
   - `DB_PASSWORD` to a secure password
   - SMTP settings (optional, for email alerts)

5. **Start the application**
   ```bash
   docker-compose up -d
   ```

6. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Option 2: Manual Setup

### Backend

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv

   # Activate (Windows):
   venv\Scripts\activate

   # Activate (Linux/Mac):
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment**
   ```bash
   copy ..\.env.example ..\.env
   # Edit .env with your settings
   ```

5. **Run migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start backend**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. **Open new terminal and navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## First Steps

1. **Register an account**
   - Go to http://localhost:3000/register
   - Create your account

2. **Add your first skill**
   - Click "Add Skill"
   - Enter a skill name (e.g., "Python")
   - Optionally add a category (e.g., "Programming")

3. **Log your first event**
   - Click on the skill
   - Click "Add Event"
   - Choose Practice or Learning
   - Fill in the details

4. **View analytics**
   - Navigate to Analytics page
   - See your input/output balance

## Common Issues

### Backend won't start
- Check if port 8000 is already in use
- Verify Python version: `python --version` (should be 3.11+)
- Check database connection in .env

### Frontend won't start
- Check if port 3000 is already in use
- Verify Node version: `node --version` (should be 18+)
- Delete `node_modules` and run `npm install` again

### Database errors
- For Docker: Ensure PostgreSQL container is running
- For manual setup: Check DATABASE_URL in .env
- Run migrations: `alembic upgrade head`

### Can't login after registration
- Check browser console for errors
- Verify backend is running
- Check CORS settings if frontend/backend on different domains

## Email Alerts Setup (Optional)

To enable email alerts:

1. **Get SMTP credentials**
   - Gmail: Use App Password (not regular password)
   - Other: Get SMTP host, port, username, password

2. **Update .env**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@yourdomain.com
   ENABLE_ALERTS=true
   ```

3. **Set up cron job** (for alerts to actually send)
   ```bash
   # Add to crontab
   0 9 * * * cd /path/to/backend && /path/to/venv/bin/python run_alerts.py
   ```

## Running Tests

### Backend Tests
```bash
cd backend
pytest
# With coverage:
pytest --cov=app tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Building for Production

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend
```bash
cd backend
# Ensure .env has production values
# Run with:
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Stopping the Application

### Docker
```bash
docker-compose down
# Remove volumes too:
docker-compose down -v
```

### Manual
- Press Ctrl+C in both terminal windows

## Next Steps

- Read [API Documentation](docs/api.md)
- Read [Deployment Guide](docs/deployment.md)
- Read [Architecture Overview](docs/architecture.md)

## Getting Help

- Check logs: `docker-compose logs -f`
- Check backend health: http://localhost:8000/health
- Open browser DevTools to see frontend errors
- Review error messages carefully - they usually indicate the issue
