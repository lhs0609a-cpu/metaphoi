from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.models.user import UserCreate, User, Token, TokenData
from app.services.supabase_client import get_supabase

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return TokenData(user_id=user_id)
    except JWTError:
        return None


async def create_user(user_data: UserCreate) -> Optional[dict]:
    supabase = get_supabase()

    # Check if user already exists
    existing = (
        supabase.table("users").select("id").eq("email", user_data.email).execute()
    )
    if existing.data:
        return None

    # Hash password
    password_hash = get_password_hash(user_data.password)

    # Insert user
    result = (
        supabase.table("users")
        .insert(
            {
                "email": user_data.email,
                "password_hash": password_hash,
                "name": user_data.name,
                "birth_date": (
                    user_data.birth_date.isoformat() if user_data.birth_date else None
                ),
                "birth_time": (
                    user_data.birth_time.isoformat() if user_data.birth_time else None
                ),
                "gender": user_data.gender,
                "blood_type": user_data.blood_type,
            }
        )
        .execute()
    )

    if result.data:
        return result.data[0]
    return None


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    supabase = get_supabase()

    result = (
        supabase.table("users")
        .select("*")
        .eq("email", email)
        .single()
        .execute()
    )

    if not result.data:
        return None

    user = result.data
    if not verify_password(password, user.get("password_hash", "")):
        return None

    return user


async def get_user_by_id(user_id: str) -> Optional[dict]:
    supabase = get_supabase()

    result = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    return result.data if result.data else None
