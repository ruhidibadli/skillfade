# SkillFade

A calm, honest, long-term personal insight product for tracking skill learning and practice.

## Philosophy

This product is a mirror, not a coach. It does not push, judge, or optimize you. It simply tells the truth, kindly and clearly.

- Respects your time, attention, and autonomy
- Assumes you are intelligent and honest
- Provides data, not directives
- Long-term trust over short-term engagement
- Simplicity over features
- Privacy over convenience

## What It Does

Exposes three realities:
1. **Learning Decay** - Skills degrade without reinforcement
2. **Practice Scarcity** - Learning without application leads to forgetting
3. **Input/Output Imbalance** - Too much consumption, too little production

## What It Does NOT Do

- Teach new skills
- Motivate through gamification
- Recommend learning resources
- Judge you

## Tech Stack

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL 15+ (or SQLite for solo users)
- SQLAlchemy 2.0
- Alembic for migrations
- passlib for password hashing

### Frontend
- React 18 + TypeScript
- React Router
- TailwindCSS
- Recharts for visualizations
- Axios for HTTP requests

### Deployment
- Docker + Docker Compose
- Self-hosted (your VPS, Raspberry Pi, or local machine)

## Quick Start (Docker)

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with your settings
4. Start the application:
   ```bash
   docker-compose up -d
   ```
5. Access at `http://localhost:3000`

## Manual Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or SQLite)

### Backend Setup

1. Create virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up database:
   ```bash
   # Create PostgreSQL database
   createdb learning_tracker

   # Run migrations
   alembic upgrade head
   ```

4. Start backend:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

See `.env.example` for all required variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT token signing key (generate with `openssl rand -hex 32`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Email settings for alerts

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/           # Config, security, database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app
│   ├── alembic/            # Database migrations
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Testing

### Backend
```bash
cd backend
pytest --cov=app tests/
```

### Frontend
```bash
cd frontend
npm run test
```

## Privacy & Data Ownership

- No third-party analytics (no Google Analytics, Mixpanel, etc.)
- Your data stays on your server
- Full JSON export available anytime
- Complete account deletion removes all data permanently
- Email only used for alerts and password reset

## Deployment Options

### Option 1: Docker Compose (Recommended)
See Quick Start section above.

### Option 2: Linux VPS
1. Install PostgreSQL
2. Clone repository
3. Set up Python virtual environment
4. Run migrations
5. Build frontend
6. Configure Nginx reverse proxy
7. Set up systemd service

See detailed deployment guide in `docs/deployment.md` (to be created).

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT License - Use freely, modify as needed.

## Support

This is a self-hosted personal tool. No official support is provided.
For issues or contributions, open a GitHub issue.
