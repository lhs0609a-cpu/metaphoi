from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    auth, tests, results, abilities, reports, payments,
    company_auth, companies, seekers, jobs, matching, applications, messages,
)

app = FastAPI(
    title=settings.app_name,
    description="14가지 성격/심리 검사를 통합하여 30개 능력치 스탯을 산출하는 종합 인재 평가 플랫폼 API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(tests.router, prefix="/api/tests", tags=["Tests"])
app.include_router(results.router, prefix="/api/results", tags=["Results"])
app.include_router(abilities.router, prefix="/api/abilities", tags=["Abilities"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])

# Marketplace
app.include_router(company_auth.router, prefix="/api/company/auth", tags=["Company Auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(seekers.router, prefix="/api/seekers", tags=["Seekers"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(matching.router, prefix="/api/matching", tags=["Matching"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])


@app.get("/")
async def root():
    return {"message": "Metaphoi API", "version": "0.1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
