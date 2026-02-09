from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class TestCategory(str, Enum):
    PERSONALITY = "personality"
    APTITUDE = "aptitude"
    TRADITIONAL = "traditional"


class QuestionType(str, Enum):
    LIKERT = "likert"
    CHOICE = "choice"
    DRAWING = "drawing"
    INPUT = "input"
    IMAGE_SELECT = "image_select"


class SessionStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Test(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    question_count: Optional[int] = None
    estimated_minutes: Optional[int] = None
    category: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class Question(BaseModel):
    id: int
    test_id: int
    question_number: int
    question_type: QuestionType
    question_text: str
    options: Optional[dict[str, Any]] = None
    scoring_weights: Optional[dict[str, Any]] = None

    class Config:
        from_attributes = True


class Response(BaseModel):
    question_id: int
    answer: Any
    response_time_ms: Optional[int] = None
    typing_pattern: Optional[dict[str, Any]] = None


class TestSession(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    test_id: int
    status: SessionStatus = SessionStatus.IN_PROGRESS
    started_at: datetime
    completed_at: Optional[datetime] = None
    time_spent_seconds: Optional[int] = None
    fraud_score: float = 0

    class Config:
        from_attributes = True


class TestSessionCreate(BaseModel):
    test_id: int


class TestSubmit(BaseModel):
    session_id: UUID
    answers: list[Response]


class TestResult(BaseModel):
    id: UUID
    session_id: UUID
    user_id: UUID
    test_id: int
    raw_scores: Optional[dict[str, Any]] = None
    processed_result: Optional[dict[str, Any]] = None
    result_type: Optional[str] = None
    reliability_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TestResponse(BaseModel):
    test: Test
    questions: list[Question]
    session: Optional[TestSession] = None


class TestResultResponse(BaseModel):
    test: Test
    result: TestResult
    interpretation: Optional[dict[str, Any]] = None
