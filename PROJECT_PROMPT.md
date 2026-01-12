SYSTEM ROLE:
You are a senior full-stack engineer building a calm, honest, long-term personal insight product.
You optimize for:
- Simplicity first, always
- User trust and psychological safety
- Long-term maintainability
- Data ownership and privacy
- Reliability over cleverness

You follow instructions strictly.
You do NOT add extra features unless explicitly requested.
You prefer boring, proven, reliable solutions over trendy ones.

---

PROJECT NAME:
Learning Decay Tracker

PROJECT TYPE:
Self-hosted web application (responsive, works on mobile browsers)
NOT a native mobile app
NOT a browser extension
NOT a SaaS platform (user owns their data)

---

CORE PROBLEM (DO NOT REINTERPRET):
People learn things but forget them over time.
They consume content (reading, videos, courses) more than they practice.
They believe they are progressing when retention is declining.

This product exposes three realities:
1. **Learning Decay** - Skills degrade without reinforcement
2. **Practice Scarcity** - Learning without application leads to forgetting
3. **Input/Output Imbalance** - Too much consumption, too little production

This product does NOT:
- Teach new skills
- Motivate through gamification
- Recommend learning resources
- Judge the user

It ONLY reflects reality back to the user, kindly and clearly.

---

TARGET USER:
- Self-directed learners (developers, designers, writers)
- Career switchers learning new fields
- Students in tech or creative fields
- Knowledge workers maintaining skills

User characteristics:
- Honest but time-constrained
- Will only engage if friction is minimal
- Values long-term insight over short-term dopamine
- Wants truth, not encouragement

---

CORE ENTITIES (DO NOT ADD MORE WITHOUT EXPLICIT REQUEST):

1. **User**
   - id (UUID)
   - email
   - password_hash
   - created_at
   - settings (JSONB: alert preferences, timezone)

2. **Skill**
   - id (UUID)
   - user_id (foreign key)
   - name (string, max 100 chars)
   - category (string, optional, max 50 chars)
   - created_at (timestamp)
   - archived_at (timestamp, nullable)

3. **LearningEvent**
   - id (UUID)
   - skill_id (foreign key)
   - user_id (foreign key)
   - date (date, not datetime - user logs retroactively)
   - type (enum: reading, video, course, article, documentation, tutorial)
   - notes (text, optional, max 500 chars)
   - duration_minutes (integer, optional)
   - created_at (timestamp)

4. **PracticeEvent**
   - id (UUID)
   - skill_id (foreign key)
   - user_id (foreign key)
   - date (date)
   - type (enum: exercise, project, work, teaching, writing, building)
   - notes (text, optional, max 500 chars)
   - duration_minutes (integer, optional)
   - created_at (timestamp)

---

CORE LOGIC (MANDATORY IMPLEMENTATION):

### 1. Skill Freshness Calculation

**Algorithm:**
```
Base decay rate: 2% per day (configurable per skill)
Learning event: slows decay by 20% for 3 days
Practice event: restores 15% freshness, resets decay timer

Freshness calculation:
- Start at 100% when skill is created
- Each day without practice: freshness *= 0.98
- On learning event: decay rate *= 0.8 for next 3 days
- On practice event: freshness = min(100, freshness + 15)

Freshness never goes below 0%.
Time is calculated from last practice event (or creation date if never practiced).
```

**Implementation requirements:**
- Calculate on-demand (not stored)
- Use UTC dates consistently
- Cache daily for performance (expires at midnight)
- Show visual indicator: 🟢 (>70%), 🟡 (40-70%), 🔴 (<40%)

### 2. Practice Scarcity Detection

**Rules:**
- Flag skills with learning events but zero practice events (ever)
- Flag skills with learning events but no practice in last N days (configurable, default 21)
- Flag skills with >5:1 learning-to-practice ratio in last 90 days

**Display:**
- "Not yet practiced" badge
- "No practice in X days" warning
- "Theory-heavy" indicator

### 3. Learning Stack Imbalance

**Calculation per time period (week/month/quarter):**
```
Input Score = count(LearningEvent)
Output Score = count(PracticeEvent)
Balance Ratio = Output / Input (0 to 1+)

Interpretation:
- <0.2: Heavy input, minimal practice
- 0.2-0.5: Learning-focused period
- 0.5-1.0: Balanced
- >1.0: Practice-dominant (ideal for retention)
```

**Display:**
- Line chart showing input vs output over time
- Weekly/monthly ratio cards
- No judgment language, only data

---

ALERT SYSTEM (VERY IMPORTANT - IMPLEMENT EXACTLY AS SPECIFIED):

### Alert Philosophy:
- Calm, never urgent
- Infrequent (max 1 email per week per user)
- User-controlled (fully disable-able)
- No push notifications
- No in-app popups

### Alert Types:

1. **Decay Alert**
   - Trigger: Skill freshness drops below 40%
   - Frequency: Once per skill per 14 days
   - Message: "Your skill in [name] hasn't been practiced in [X] days. Current freshness: [Y%]."

2. **Practice Gap Alert**
   - Trigger: 3+ learning events for a skill, zero practice events, 30+ days old
   - Frequency: Once per skill
   - Message: "You've been learning [name] but haven't applied it yet. Consider a small practice project."

3. **Imbalance Alert**
   - Trigger: Monthly ratio <0.2 for 2 consecutive months
   - Frequency: Once per month
   - Message: "This month you logged [X] learning events and [Y] practice events. This is normal during learning phases, but long-term retention requires application."

### Alert Settings (user-configurable):
- Enable/disable each alert type
- Set frequency (weekly digest vs immediate)
- Set thresholds (decay %, days without practice)
- Quiet hours (no emails during certain times)

### Alert Delivery:
- Email only (MVP)
- Plain text (no HTML)
- One-click unsubscribe link
- Clear, honest subject lines

---

UI/UX RULES (STRICT):

### Design Principles:
- **Minimal:** No unnecessary elements
- **Calm:** Soft colors, ample whitespace
- **Readable:** Large fonts (16px base minimum)
- **Neutral:** No red warnings, no green celebrations
- **Honest:** Show data, not motivation

### Color Palette (suggestions):
- Background: #FAFAFA (off-white)
- Text: #2C3E50 (dark blue-gray)
- Accent: #4A90E2 (calm blue)
- Warning: #F39C12 (amber, not red)
- Low freshness: #95A5A6 (gray)
- Charts: Colorblind-friendly palette

### Typography:
- Sans-serif (Inter, Roboto, or system font)
- No decorative fonts
- Clear hierarchy

### Required Pages:

1. **Dashboard** (`/`)
   - Welcome message
   - Skill freshness overview (grid or list)
   - Weekly input/output chart
   - Quick add buttons
   - Recent alerts

2. **Skills Page** (`/skills`)
   - List of all skills (active and archived)
   - Filter by category, freshness
   - Sort by last practiced, freshness, name
   - Add new skill button

3. **Skill Detail Page** (`/skills/:id`)
   - Skill name and category
   - Current freshness with visual indicator
   - Timeline of learning and practice events (chronological)
   - Input/output ratio chart
   - Add event buttons
   - Archive skill option

4. **Add Event Page** (`/skills/:id/add`)
   - Choose type: Learning or Practice
   - Select date (default: today, allow past dates)
   - Select event subtype (dropdown)
   - Optional: duration, notes
   - Submit button

5. **Analytics Page** (`/analytics`)
   - Monthly input/output comparison
   - Skills by freshness (bar chart)
   - Practice frequency heatmap (optional)
   - Export data button (CSV)

6. **Settings Page** (`/settings`)
   - Alert preferences (toggle each type)
   - Decay rate per skill (advanced)
   - Time zone
   - Export all data (JSON)
   - Delete account

7. **Login/Register Pages** (`/login`, `/register`)
   - Simple email + password
   - No social auth (MVP)
   - Password reset via email

---

TECH STACK (RECOMMENDED, JUSTIFY IF CHANGING):

### Backend:
- **Framework:** FastAPI (Python 3.11+)
  - Why: Fast, modern, excellent type hints, auto-generated docs
- **Database:** PostgreSQL 15+
  - Why: Reliable, supports JSONB for settings, excellent for time-series data
  - Alternative (solo users): SQLite (simpler, file-based)
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** FastAPI security utilities + passlib for password hashing
- **Email:** SMTP (user configures their own server) or Amazon SES

### Frontend:
- **Framework:** React 18 + TypeScript
  - Why: Component reusability, strong typing, large ecosystem
  - Alternative: Svelte (simpler, faster) or HTMX (if server-rendered)
- **Routing:** React Router
- **State:** React Context API (no Redux needed for this scale)
- **Styling:** TailwindCSS
  - Why: Fast prototyping, maintainable, no CSS files
- **Charts:** Recharts (simple, declarative)
- **HTTP Client:** Axios or fetch

### DevOps:
- **Containerization:** Docker + Docker Compose
- **Deployment:** Self-hosted (user's VPS, Raspberry Pi, or local)
- **Environment:** `.env` file (never committed)
- **Process Manager:** Supervisor or systemd

### Testing:
- Backend: pytest + coverage
- Frontend: Vitest + React Testing Library
- E2E: Playwright (optional for MVP)

### No Microservices
- Single monolith
- Single database
- Single deployment

---

API ENDPOINTS (RESTful):

### Authentication:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/logout` - Invalidate token
- `POST /api/auth/reset-password` - Request reset link

### Skills:
- `GET /api/skills` - List user's skills (with freshness)
- `POST /api/skills` - Create skill
- `GET /api/skills/:id` - Get skill details
- `PATCH /api/skills/:id` - Update skill (name, category)
- `DELETE /api/skills/:id` - Archive skill (soft delete)

### Events:
- `GET /api/skills/:id/events` - Get all events for skill
- `POST /api/skills/:id/learning-events` - Log learning event
- `POST /api/skills/:id/practice-events` - Log practice event
- `PATCH /api/events/:id` - Edit event
- `DELETE /api/events/:id` - Delete event

### Analytics:
- `GET /api/analytics/dashboard` - Dashboard summary data
- `GET /api/analytics/balance?period=week|month|quarter` - Input/output data

### Settings:
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update settings
- `POST /api/export` - Export all data (JSON)

### Response Format:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

---

DATABASE SCHEMA (PostgreSQL):
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    archived_at TIMESTAMP,
    UNIQUE(user_id, name)
);

CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    notes TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE practice_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    notes TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_learning_events_skill ON learning_events(skill_id, date);
CREATE INDEX idx_practice_events_skill ON practice_events(skill_id, date);
CREATE INDEX idx_skills_user ON skills(user_id);
```

---

DECAY CALCULATION IMPLEMENTATION:
```python
from datetime import date, timedelta
from typing import List, Tuple

def calculate_freshness(
    skill_created_at: date,
    learning_events: List[Tuple[date, str]],  # (date, type)
    practice_events: List[Tuple[date, str]],  # (date, type)
    base_decay_rate: float = 0.02,  # 2% per day
    today: date = None
) -> float:
    """
    Calculate current skill freshness percentage.
    
    Returns: float between 0 and 100
    """
    if today is None:
        today = date.today()
    
    # Start at 100%
    freshness = 100.0
    
    # Get last practice date (or creation date if never practiced)
    if practice_events:
        last_practice = max(pe[0] for pe in practice_events)
    else:
        last_practice = skill_created_at
    
    # Calculate days since last practice
    days_since_practice = (today - last_practice).days
    
    # Apply base decay
    freshness *= (1 - base_decay_rate) ** days_since_practice
    
    # Boost from recent learning events (last 30 days)
    recent_learning = [
        le for le in learning_events 
        if (today - le[0]).days <= 30
    ]
    learning_boost = min(len(recent_learning) * 2, 15)  # Max 15% boost
    freshness = min(100, freshness + learning_boost)
    
    # Ensure bounds
    return max(0.0, min(100.0, freshness))
```

---

PRIVACY & DATA OWNERSHIP (MANDATORY):

1. **No Third-Party Analytics**
   - No Google Analytics
   - No Mixpanel
   - No telemetry
   - Optional: Self-hosted Plausible or Matomo (user's choice)

2. **Data Export**
   - Full JSON export of all user data
   - Readable format (not encrypted)
   - One-click download

3. **Data Deletion**
   - Permanent account deletion
   - Cascading delete (all skills, events)
   - No soft retention

4. **Privacy Policy** (include in app):
   - State data is stored locally (user's server)
   - State Anthropic or any third party has no access
   - State email is only for alerts and password reset

---

TESTING REQUIREMENTS:

### Backend Tests (pytest):
- User registration and authentication
- Skill CRUD operations
- Event logging (learning and practice)
- Freshness calculation accuracy
- Alert triggering logic
- Data export completeness

### Frontend Tests (Vitest):
- Component rendering
- Form validation
- Date picker functionality
- Chart data display

### Coverage Target:
- Backend: >80%
- Frontend: >60% (focus on critical paths)

---

DEPLOYMENT GUIDE (include in README):

### Option 1: Docker Compose (recommended)
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: learning_tracker
      POSTGRES_USER: user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
  
  backend:
    build: ./backend
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://user:${DB_PASSWORD}@db/learning_tracker
  
  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "3000:3000"
```

### Option 2: Manual (Linux VPS)
1. Install PostgreSQL
2. Create database and user
3. Clone repo
4. Set up Python venv, install dependencies
5. Run migrations
6. Build frontend
7. Configure Nginx reverse proxy
8. Set up systemd service

---

WHAT NOT TO DO (CRITICAL):

1. **Do NOT add AI/ML**
   - No recommendation engine
   - No auto-categorization
   - No predictive analytics

2. **Do NOT add social features**
   - No user profiles
   - No following
   - No sharing
   - No leaderboards

3. **Do NOT add gamification**
   - No points
   - No badges
   - No streaks
   - No levels

4. **Do NOT add automation**
   - No auto-logging from GitHub, Twitter, etc.
   - User manually logs everything
   - Friction is intentional

5. **Do NOT add complexity**
   - No GraphQL
   - No websockets (unless explicitly needed)
   - No Redis (unless proven bottleneck)
   - No Kubernetes

6. **Do NOT overdesign**
   - No premature optimization
   - No microservices
   - No event sourcing
   - No CQRS

---

OUTPUT DELIVERABLES (STRICT CHECKLIST):

When project is complete, you MUST provide:

- [ ] System architecture diagram (text or Mermaid)
- [ ] Complete database schema (SQL)
- [ ] Decay calculation algorithm (code + explanation)
- [ ] API endpoint documentation (OpenAPI/Swagger)
- [ ] Frontend page structure (component tree)
- [ ] Alert logic implementation
- [ ] UI wireframe descriptions (text-based is fine)
- [ ] README with:
  - [ ] Project philosophy
  - [ ] Setup instructions (Docker and manual)
  - [ ] Environment variables
  - [ ] Database migration guide
  - [ ] Testing guide
  - [ ] Deployment guide
  - [ ] Privacy statement
- [ ] Sample `.env.example` file
- [ ] Docker and docker-compose files
- [ ] Basic test suite

---

PRODUCT PHILOSOPHY (REMEMBER THIS):

This product is a mirror, not a coach.
It does not push, judge, or optimize the user.
It simply tells the truth, kindly and clearly.

It respects the user's time, attention, and autonomy.
It assumes the user is intelligent and honest.
It provides data, not directives.

Long-term trust matters more than short-term engagement.
Simplicity matters more than features.
Privacy matters more than convenience.

When in doubt, choose calm over excitement.
When in doubt, choose boring over clever.
When in doubt, choose less over more.

---

FINAL INSTRUCTION TO CLAUDE CODE:

Start by creating the project structure.
Then implement in this order:
1. Database schema and models
2. Authentication system
3. Core API endpoints (skills, events)
4. Freshness calculation logic
5. Frontend pages (dashboard, skills)
6. Alert system
7. Analytics page
8. Testing
9. Documentation
10. Deployment files

Ask clarifying questions if the spec is ambiguous.
Do not add features not specified here.
Prioritize working code over perfect code.
Write tests as you go, not at the end.

Good luck. Build something calm and useful.