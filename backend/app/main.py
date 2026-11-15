import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_database
from app.api import auth, subscriptions, tickets, ai, kb, dashboard, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Run automatic seeding of demo accounts & data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-Powered Subscription Product Support Desk API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev & preview convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(tickets.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(kb.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_provider": settings.AI_PROVIDER
    }

@app.get("/api/download-project")
def download_project_zip():
    base_dir = Path(__file__).resolve().parent.parent.parent
    zip_candidates = [
        base_dir / "subscription-support-desk.zip",
        base_dir.parent / "subscription-support-desk.zip"
    ]
    for zip_path in zip_candidates:
        if zip_path.exists():
            return FileResponse(
                path=str(zip_path),
                filename="subscription-support-desk.zip",
                media_type="application/zip"
            )
    return {"detail": "Project zip file not found on server"}

# Frontend Static Hosting (Serves the entire SPA from FastAPI when built)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    # Mount static assets
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    # SPA catch-all route for frontend client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        
        target_file = frontend_dist / full_path
        if full_path and target_file.exists() and target_file.is_file():
            return FileResponse(target_file)
        
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"detail": "Frontend index.html not found"}
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "status": "online",
            "docs_url": "/docs",
            "api_v1": settings.API_V1_STR,
            "note": "Frontend build not detected in frontend/dist. Run 'npm run build' in frontend directory to serve full SPA."
        }
