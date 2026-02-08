from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, time, datetime
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    birth_date: Optional[date] = None
    birth_time: Optional[time] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None
    birth_time: Optional[time] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    profile_image_url: Optional[str] = None


class User(UserBase):
    id: UUID
    birth_date: Optional[date] = None
    birth_time: Optional[time] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: Optional[str] = None
    profile_image_url: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
