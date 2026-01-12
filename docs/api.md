# API Documentation

Base URL: `http://localhost:8000/api`

All requests require JSON content type except where noted.
Protected endpoints require `Authorization: Bearer <token>` header.

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "settings": {},
  "created_at": "2024-01-01T00:00:00"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Successfully logged out"
}
```

## Skills

### List Skills
```http
GET /skills?include_archived=false
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Python",
    "category": "Programming",
    "created_at": "2024-01-01T00:00:00",
    "archived_at": null,
    "freshness": 85.5,
    "days_since_practice": 3,
    "practice_count": 10,
    "learning_count": 15
  }
]
```

### Create Skill
```http
POST /skills
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Python",
  "category": "Programming"
}

Response: 201 Created
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Python",
  "category": "Programming",
  "created_at": "2024-01-01T00:00:00",
  "archived_at": null,
  "freshness": 100.0,
  "days_since_practice": 0,
  "practice_count": 0,
  "learning_count": 0
}
```

### Get Skill
```http
GET /skills/{skill_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Python",
  "category": "Programming",
  "created_at": "2024-01-01T00:00:00",
  "archived_at": null,
  "freshness": 85.5,
  "days_since_practice": 3,
  "practice_count": 10,
  "learning_count": 15
}
```

### Update Skill
```http
PATCH /skills/{skill_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Advanced Python",
  "category": "Programming"
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Advanced Python",
  "category": "Programming",
  "created_at": "2024-01-01T00:00:00",
  "archived_at": null,
  "freshness": 85.5,
  "days_since_practice": 3,
  "practice_count": 10,
  "learning_count": 15
}
```

### Archive Skill
```http
DELETE /skills/{skill_id}
Authorization: Bearer <token>

Response: 204 No Content
```

## Events

### Get Skill Events
```http
GET /skills/{skill_id}/events
Authorization: Bearer <token>

Response: 200 OK
{
  "events": [
    {
      "id": "uuid",
      "skill_id": "uuid",
      "user_id": "uuid",
      "date": "2024-01-15",
      "type": "exercise",
      "notes": "Completed coding challenge",
      "duration_minutes": 60,
      "created_at": "2024-01-15T10:00:00",
      "event_type": "practice"
    },
    {
      "id": "uuid",
      "skill_id": "uuid",
      "user_id": "uuid",
      "date": "2024-01-14",
      "type": "video",
      "notes": "Watched tutorial series",
      "duration_minutes": 120,
      "created_at": "2024-01-14T15:00:00",
      "event_type": "learning"
    }
  ]
}
```

### Create Learning Event
```http
POST /skills/{skill_id}/learning-events
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "type": "reading",
  "notes": "Read documentation",
  "duration_minutes": 45
}

Response: 201 Created
{
  "id": "uuid",
  "skill_id": "uuid",
  "user_id": "uuid",
  "date": "2024-01-15",
  "type": "reading",
  "notes": "Read documentation",
  "duration_minutes": 45,
  "created_at": "2024-01-15T10:00:00"
}
```

Learning event types: `reading`, `video`, `course`, `article`, `documentation`, `tutorial`

### Create Practice Event
```http
POST /skills/{skill_id}/practice-events
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "type": "project",
  "notes": "Built a web scraper",
  "duration_minutes": 120
}

Response: 201 Created
{
  "id": "uuid",
  "skill_id": "uuid",
  "user_id": "uuid",
  "date": "2024-01-15",
  "type": "project",
  "notes": "Built a web scraper",
  "duration_minutes": 120,
  "created_at": "2024-01-15T10:00:00"
}
```

Practice event types: `exercise`, `project`, `work`, `teaching`, `writing`, `building`

### Update Learning Event
```http
PATCH /learning-events/{event_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Updated notes"
}

Response: 200 OK
```

### Update Practice Event
```http
PATCH /practice-events/{event_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Updated notes"
}

Response: 200 OK
```

### Delete Learning Event
```http
DELETE /learning-events/{event_id}
Authorization: Bearer <token>

Response: 204 No Content
```

### Delete Practice Event
```http
DELETE /practice-events/{event_id}
Authorization: Bearer <token>

Response: 204 No Content
```

## Analytics

### Dashboard Data
```http
GET /analytics/dashboard
Authorization: Bearer <token>

Response: 200 OK
{
  "total_skills": 5,
  "learning_events_this_week": 8,
  "practice_events_this_week": 4,
  "weekly_balance_ratio": 0.5,
  "balance_interpretation": "Balanced"
}
```

### Balance Data
```http
GET /analytics/balance?period=month
Authorization: Bearer <token>

Query Parameters:
- period: week | month | quarter (default: month)

Response: 200 OK
{
  "period": "month",
  "data": [
    {
      "date": "2024-01-01",
      "learning": 2,
      "practice": 1
    },
    ...
  ],
  "total_learning": 30,
  "total_practice": 15,
  "balance_ratio": 0.5,
  "interpretation": "Balanced"
}
```

### Skills by Freshness
```http
GET /analytics/skills-by-freshness
Authorization: Bearer <token>

Response: 200 OK
{
  "data": [
    {
      "range": "High (>70%)",
      "count": 3
    },
    {
      "range": "Medium (40-70%)",
      "count": 1
    },
    {
      "range": "Low (<40%)",
      "count": 1
    }
  ]
}
```

## Settings

### Get Settings
```http
GET /settings
Authorization: Bearer <token>

Response: 200 OK
{
  "settings": {
    "alerts_enabled": true,
    "decay_alerts_enabled": true,
    "practice_gap_alerts_enabled": true,
    "imbalance_alerts_enabled": true
  }
}
```

### Update Settings
```http
PATCH /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "settings": {
    "alerts_enabled": false
  }
}

Response: 200 OK
{
  "settings": {
    "alerts_enabled": false
  }
}
```

### Export Data
```http
GET /settings/export
Authorization: Bearer <token>

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00",
    "settings": {}
  },
  "skills": [
    {
      "id": "uuid",
      "name": "Python",
      "category": "Programming",
      "created_at": "2024-01-01T00:00:00",
      "archived_at": null,
      "learning_events": [...],
      "practice_events": [...]
    }
  ]
}
```

### Delete Account
```http
DELETE /settings/account
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Account successfully deleted"
}
```

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
