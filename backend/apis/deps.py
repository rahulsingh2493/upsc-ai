from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from models import users, user_profile
from config.settings import settings
from core.database import get_db

oauth2_schema = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token:str = Depends(oauth2_schema), db: Session = Depends(get_db)) -> models.User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id : str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate":"Bearer"})


    user = db.query(users.User).filter(users.User.id==int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_NOT_FOUND, detail="Inactive user")

    return user