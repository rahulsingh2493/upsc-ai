import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from models.users import User


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    first_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    middle_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    last_name_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    education: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    optional_subject: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    medium: Mapped[str] = mapped_column(String(32), default="English", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="profile")