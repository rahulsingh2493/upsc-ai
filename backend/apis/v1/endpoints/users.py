from fastapi import APIRouter, Depends
from models.users import User
from schemas.users import UserResponse
from apis.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user