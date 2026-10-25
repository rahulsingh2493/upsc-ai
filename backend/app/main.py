from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from models.base import Base
from core.database import engine
from config.settings import settings

from apis.v1.router import api_router



Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth API Service", version="1.0.0")

app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET_KEY)

app.include_router(api_router, prefix="/api/v1")