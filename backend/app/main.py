from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, skills, events, analytics, settings, templates
from app.core.config import settings as app_settings

app = FastAPI(
    title="SkillFade API",
    description="A calm, honest personal insight product for tracking skill learning and practice",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[app_settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(skills.router)
app.include_router(events.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(templates.router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "SkillFade API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
