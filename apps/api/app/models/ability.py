from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class AbilityCategory(str, Enum):
    MENTAL = "mental"  # 정신력
    SOCIAL = "social"  # 사회성
    WORK = "work"  # 업무역량
    PHYSICAL = "physical"  # 신체/감각
    POTENTIAL = "potential"  # 잠재력


class Ability(BaseModel):
    id: int
    code: str
    name: str
    category: AbilityCategory
    description: Optional[str] = None
    max_score: int = 20

    class Config:
        from_attributes = True


class UserAbility(BaseModel):
    id: int
    user_id: UUID
    ability_id: int
    score: Optional[float] = None
    confidence: Optional[float] = None
    source_tests: Optional[dict[str, Any]] = None
    calculated_at: datetime

    class Config:
        from_attributes = True


class AbilityScore(BaseModel):
    code: str
    name: str
    category: str
    score: float
    max_score: int = 20
    confidence: float
    source_tests: list[str]


class AbilityRadarData(BaseModel):
    category: str
    abilities: list[AbilityScore]


class AllAbilitiesResponse(BaseModel):
    total_score: float
    max_total_score: float
    reliability: float
    categories: list[AbilityRadarData]
    completed_tests: list[str]
    pending_tests: list[str]


# 30가지 능력치 정의
ABILITY_DEFINITIONS = [
    # 정신력 (Mental)
    {"code": "determination", "name": "결단력", "category": "mental"},
    {"code": "composure", "name": "침착성", "category": "mental"},
    {"code": "concentration", "name": "집중력", "category": "mental"},
    {"code": "creativity", "name": "창의성", "category": "mental"},
    {"code": "analytical", "name": "분석력", "category": "mental"},
    {"code": "adaptability", "name": "적응력", "category": "mental"},
    # 사회성 (Social)
    {"code": "communication", "name": "소통능력", "category": "social"},
    {"code": "teamwork", "name": "협동심", "category": "social"},
    {"code": "leadership", "name": "리더십", "category": "social"},
    {"code": "empathy", "name": "공감능력", "category": "social"},
    {"code": "influence", "name": "영향력", "category": "social"},
    {"code": "networking", "name": "네트워킹", "category": "social"},
    # 업무역량 (Work)
    {"code": "execution", "name": "실행력", "category": "work"},
    {"code": "planning", "name": "기획력", "category": "work"},
    {"code": "problem_solving", "name": "문제해결", "category": "work"},
    {"code": "time_management", "name": "시간관리", "category": "work"},
    {"code": "attention_detail", "name": "꼼꼼함", "category": "work"},
    {"code": "multitasking", "name": "멀티태스킹", "category": "work"},
    # 신체/감각 (Physical)
    {"code": "stress_resistance", "name": "스트레스내성", "category": "physical"},
    {"code": "endurance", "name": "지구력", "category": "physical"},
    {"code": "intuition", "name": "직관력", "category": "physical"},
    {"code": "aesthetic", "name": "심미안", "category": "physical"},
    {"code": "spatial", "name": "공간지각", "category": "physical"},
    {"code": "verbal", "name": "언어능력", "category": "physical"},
    # 잠재력 (Potential)
    {"code": "growth_potential", "name": "성장가능성", "category": "potential"},
    {"code": "learning_speed", "name": "학습속도", "category": "potential"},
    {"code": "innovation", "name": "혁신성", "category": "potential"},
    {"code": "resilience", "name": "회복탄력성", "category": "potential"},
    {"code": "ambition", "name": "야망", "category": "potential"},
    {"code": "integrity", "name": "성실성", "category": "potential"},
]
