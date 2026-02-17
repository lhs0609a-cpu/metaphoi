from datetime import timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr

from app.config import settings
from app.services.company_auth_service import (
    create_company_and_member,
    authenticate_company_member,
    get_company_member_by_id,
    create_company_token,
    decode_company_token,
)

router = APIRouter()
company_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/company/auth/login")


class CompanyRegisterRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    member_name: str
    industry: Optional[str] = None
    size_range: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None


class CompanyLoginRequest(BaseModel):
    email: EmailStr
    password: str


class CompanyTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CompanyMemberResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    company_id: str
    company_name: str


async def get_current_company_member(
    token: Annotated[str, Depends(company_oauth2_scheme)]
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate company credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = decode_company_token(token)
    if token_data is None or token_data.user_id is None:
        raise credentials_exception

    member = await get_company_member_by_id(token_data.user_id)
    if member is None:
        raise credentials_exception

    return member


@router.post("/register", response_model=CompanyTokenResponse)
async def register_company(data: CompanyRegisterRequest):
    result = await create_company_and_member(
        company_name=data.company_name,
        email=data.email,
        password=data.password,
        member_name=data.member_name,
        industry=data.industry,
        size_range=data.size_range,
        website=data.website,
        location=data.location,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    access_token = create_company_token(
        data={"sub": result["member"]["id"]},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return CompanyTokenResponse(access_token=access_token)


@router.post("/login", response_model=CompanyTokenResponse)
async def login_company(data: CompanyLoginRequest):
    member = await authenticate_company_member(data.email, data.password)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = create_company_token(
        data={"sub": member["id"]},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return CompanyTokenResponse(access_token=access_token)


@router.get("/me", response_model=CompanyMemberResponse)
async def get_company_me(
    current_member: Annotated[dict, Depends(get_current_company_member)]
):
    company = current_member.get("companies", {})
    return CompanyMemberResponse(
        id=current_member["id"],
        email=current_member["email"],
        name=current_member["name"],
        role=current_member["role"],
        company_id=current_member["company_id"],
        company_name=company.get("name", ""),
    )
