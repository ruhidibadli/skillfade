# System Architecture

## Overview

The Learning Decay Tracker is a monolithic web application with a clear separation between backend and frontend, designed for self-hosting.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                  │
│  ┌──────────────────┐           ┌────────────────────────┐ │
│  │   Static Files   │           │    API Proxy /api/*    │ │
│  │   (Frontend)     │           │                        │ │
│  └──────────────────┘           └────────────────────────┘ │
└──────────┬──────────────────────────────┬──────────────────┘
           │                              │
           ▼                              ▼
┌────────────────────┐        ┌──────────────────────────────┐
│  React Frontend    │        │   FastAPI Backend            │
│  - TypeScript      │        │   - Python 3.11              │
│  - TailwindCSS     │        │   - SQLAlchemy ORM           │
│  - React Router    │        │   - JWT Auth                 │
│  - Recharts        │        │   - Email Alerts             │
│  - Axios           │        │                              │
└────────────────────┘        └────────────┬─────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────────┐
                              │   PostgreSQL Database        │
                              │   - Users                    │
                              │   - Skills                   │
                              │   - Learning Events          │
                              │   - Practice Events          │
                              └──────────────────────────────┘

                              ┌──────────────────────────────┐
                              │   SMTP Server (External)     │
                              │   - Alert Emails             │
                              └──────────────────────────────┘
```

## Technology Stack

### Backend

**Framework:** FastAPI
- Fast, modern Python web framework
- Automatic OpenAPI/Swagger documentation
- Built-in validation with Pydantic
- Async support (though not used in MVP)

**Database:** PostgreSQL 15+ or SQLite
- PostgreSQL for multi-user deployments
- SQLite for single-user simplicity
- SQLAlchemy 2.0 ORM for database abstraction
- Alembic for schema migrations

**Authentication:** JWT (JSON Web Tokens)
- Stateless authentication
- Token expiry: 30 minutes (configurable)
- passlib for password hashing (bcrypt)

**Email:** SMTP
- Plain text emails only
- User-configurable SMTP server
- Optional feature (app works without it)

### Frontend

**Framework:** React 18 + TypeScript
- Component-based UI
- Type safety with TypeScript
- React Router for client-side routing
- Context API for state management (no Redux needed)

**Styling:** TailwindCSS
- Utility-first CSS framework
- Consistent, calm design system
- Responsive by default

**Charting:** Recharts
- Declarative React charts
- Line charts for balance data
- Bar charts for freshness distribution

**Build Tool:** Vite
- Fast development server
- Optimized production builds
- Hot module replacement

### DevOps

**Containerization:** Docker + Docker Compose
- Isolated services
- Easy deployment
- Consistent environments

**Process Management:** systemd (manual deployment)
- Automatic service restart
- Logging integration

**Web Server:** Nginx
- Reverse proxy
- Static file serving
- SSL termination

## Database Schema

### Users Table
```sql
id              UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
settings        JSONB DEFAULT '{}'
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### Skills Table
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
name            VARCHAR(100) NOT NULL
category        VARCHAR(50)
created_at      TIMESTAMP DEFAULT NOW()
archived_at     TIMESTAMP
UNIQUE(user_id, name)
```

### Learning Events Table
```sql
id                  UUID PRIMARY KEY
skill_id            UUID REFERENCES skills(id) ON DELETE CASCADE
user_id             UUID REFERENCES users(id) ON DELETE CASCADE
date                DATE NOT NULL
type                VARCHAR(50) NOT NULL
notes               TEXT
duration_minutes    INTEGER
created_at          TIMESTAMP DEFAULT NOW()
INDEX(skill_id, date)
```

### Practice Events Table
```sql
id                  UUID PRIMARY KEY
skill_id            UUID REFERENCES skills(id) ON DELETE CASCADE
user_id             UUID REFERENCES users(id) ON DELETE CASCADE
date                DATE NOT NULL
type                VARCHAR(50) NOT NULL
notes               TEXT
duration_minutes    INTEGER
created_at          TIMESTAMP DEFAULT NOW()
INDEX(skill_id, date)
```

## Core Algorithms

### Freshness Calculation

```python
def calculate_freshness(skill_created_at, learning_events, practice_events):
    freshness = 100.0

    # Find last practice or creation date
    last_practice = max(practice_dates) if practice_events else skill_created_at
    days_since_practice = (today - last_practice).days

    # Apply 2% daily decay
    freshness *= (0.98 ** days_since_practice)

    # Boost from recent learning (last 30 days)
    recent_learning = count(events in last 30 days)
    boost = min(recent_learning * 2, 15)  # Max 15% boost
    freshness = min(100, freshness + boost)

    return max(0, min(100, freshness))
```

### Balance Ratio

```python
balance_ratio = practice_count / learning_count

Interpretation:
- < 0.2: Heavy input, minimal practice
- 0.2-0.5: Learning-focused
- 0.5-1.0: Balanced
- > 1.0: Practice-dominant (ideal)
```

## Alert System

### Alert Types

1. **Decay Alert**
   - Trigger: Freshness < 40%
   - Frequency: Once per skill per 14 days

2. **Practice Gap Alert**
   - Trigger: 3+ learning events, 0 practice events, 30+ days old
   - Frequency: Once per skill (ever)

3. **Imbalance Alert**
   - Trigger: Monthly ratio < 0.2 for 2 consecutive months
   - Frequency: Once per month

### Alert Processing

Alerts are processed via a scheduled job (cron):
```bash
# Daily at 9 AM
0 9 * * * cd /app/backend && python run_alerts.py
```

## API Design

**RESTful Endpoints:**
- `/api/auth/*` - Authentication
- `/api/skills/*` - Skill management
- `/api/skills/:id/events` - Event retrieval
- `/api/skills/:id/learning-events` - Learning event creation
- `/api/skills/:id/practice-events` - Practice event creation
- `/api/analytics/*` - Analytics data
- `/api/settings/*` - User settings

**Response Format:**
All successful responses return data directly or in a `{data: ...}` wrapper.
Errors return `{detail: "error message"}`.

**Authentication:**
Bearer token in `Authorization` header.

## Security Considerations

1. **Password Security**
   - bcrypt hashing
   - Minimum 8 characters
   - No password reset in MVP (users manage via email)

2. **JWT Security**
   - Short expiration (30 minutes)
   - Secret key from environment variable
   - HTTPS only in production

3. **Database Security**
   - Parameterized queries (SQLAlchemy ORM)
   - No raw SQL execution
   - Cascade deletes for data integrity

4. **Privacy**
   - No third-party analytics
   - No external API calls (except SMTP)
   - User controls all data

## Performance Considerations

1. **Database Indexing**
   - User email (unique index)
   - Event dates (composite index with skill_id)
   - Skill user_id (foreign key index)

2. **Caching**
   - Freshness calculation could be cached daily
   - Not implemented in MVP for simplicity

3. **Query Optimization**
   - Eager loading relationships where needed
   - Limited result sets (pagination not in MVP)

## Scalability Limits

This architecture is designed for **single-user or small team deployments**:

- Database: Single PostgreSQL instance
- No caching layer (Redis)
- No CDN
- No load balancing
- No horizontal scaling

**Expected capacity:**
- Users: 1-100
- Skills per user: 10-50
- Events per day: 10-100
- Concurrent users: 1-10

For larger deployments, consider:
- Read replicas
- Redis caching
- CDN for static assets
- Horizontal API scaling

## File Structure

```
learning-decay-tracker/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
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
│   │   ├── context/        # React context
│   │   └── App.tsx
│   └── package.json
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## Development Workflow

1. **Start development environment:**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

3. **Create new migration:**
   ```bash
   docker-compose exec backend alembic revision --autogenerate -m "description"
   ```

4. **Run tests:**
   ```bash
   docker-compose exec backend pytest
   docker-compose exec frontend npm test
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

## Monitoring & Logging

**Backend Logs:**
- uvicorn access logs
- Application errors to stderr
- systemd journal (manual deployment)

**Frontend:**
- Browser console errors
- Network errors in DevTools

**Database:**
- PostgreSQL logs
- Slow query log (if needed)

**Health Checks:**
- `/health` endpoint (200 OK)
- Database connection check

## Future Enhancements (Not in MVP)

- Password reset via email
- Two-factor authentication
- Data import from CSV/JSON
- Practice reminders (push notifications)
- Mobile app (React Native)
- Skill categories auto-suggestion
- Event templates
- Bulk event logging
- Custom decay rates per skill
- Collaborative skills (team mode)
