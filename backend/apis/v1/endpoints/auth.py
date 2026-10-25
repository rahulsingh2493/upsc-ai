from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models.users import User
from schemas.users import UserCreate, UserResponse, Token
from core.security import hash_password, verify_password, create_access_token
from config.settings import settings
from core.oauth import oauth
from core.database import get_db




router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data : UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered.")

    new_user = User(email=user_data.email, hashed_password=hash_password(user_data.password))

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not user.hashed_password or not verify_password(form_data.password, User.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.", headers={"WWW-Authentication":"Bearer"})

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type":"bearer"}


@router.get("/google")
async def google_login(request : Request):
    return await oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@router.get("/google/callback", response_model=Token)
async def google_callback(request : Request, db: Session = Depends(get_db)):
    token_response = await oauth.google.authorize_access_token(request)
    user_info = token_response.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google Authentication Failed.")
    google_id = user_info["sub"]
    email = user_info["email"]

    user = db.query(User).filter((User.google_id==google_id) | (User.email == email)).first()
    if not user:
        user = User(email=email, google_id=google_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        user.google_id = google_id
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "email" : user.email})
    return {"access_token" : token, "token_type": "bearer"}


class GoogleTokenRequest(BaseModel):
    credential: str


@router.post("/google")
def google_login_with_token(payload: GoogleTokenRequest, db: Session = Depends(get_db)):
    try:
        info = id_token.verify_oauth2_token(
            payload.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token.")

    google_id = info["sub"]
    email = info["email"]

    user = db.query(User).filter((User.google_id == google_id) | (User.email == email)).first()
    if not user:
        user = User(email=email, google_id=google_id, auth_provider="google", is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        user.google_id = google_id
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"name": info.get("name") or email.split("@")[0], "email": user.email},
    }