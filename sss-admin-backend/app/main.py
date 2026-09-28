from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import initialize_database, close_database
from app.routers.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_database()

    yield

    await close_database()


app = FastAPI(
    title="SSS School Admin",
    version="1.0.0",
    description="Backend API for SSS School Admin Dashboard",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        x.strip()
        for x in settings.allowed_origins.split(",")
        if x.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(admin_router)


@app.get("/health")
async def health():
    return {
        "status": "ok"
    }