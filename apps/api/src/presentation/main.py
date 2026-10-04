from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.src.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de recursos (pools, conexiones)
    yield
    # Limpieza al cerrar la aplicación


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Auditor Financiero & Gestor de Gastos con Ingesta Telegram y Dashboard Táctil",
    lifespan=lifespan,
)

# CORS Middleware (permitir llamadas del frontend local y producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from apps.api.src.presentation.api_v1.webhooks.telegram import router as telegram_router
app.include_router(telegram_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["System"])
async def health_check():
    """Endpoint de sanidad para monitoreo y orquestación."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Bienvenido a Stampy API. Sistema listo y auditado [ ✦ OK ].",
        "docs_url": "/docs",
    }
