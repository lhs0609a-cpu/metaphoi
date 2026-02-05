"""
AI 분석 서비스
OpenAI GPT-4 또는 Anthropic Claude를 사용하여 검사 결과를 분석합니다.
"""

import os
import json
from typing import Optional
from openai import OpenAI
from anthropic import Anthropic
from app.config import settings


def get_openai_client() -> Optional[OpenAI]:
    """OpenAI 클라이언트 반환"""
    api_key = os.getenv("OPENAI_API_KEY") or settings.openai_api_key
    if api_key:
        return OpenAI(api_key=api_key)
    return None


def get_anthropic_client() -> Optional[Anthropic]:
    """Anthropic 클라이언트 반환"""
    api_key = os.getenv("ANTHROPIC_API_KEY") or getattr(settings, "anthropic_api_key", None)
    if api_key:
        return Anthropic(api_key=api_key)
    return None


class AIAnalysisService:
    """AI 기반 검사 결과 분석 서비스"""

    def __init__(self):
        self.openai = get_openai_client()
        self.anthropic = get_anthropic_client()

    async def analyze_test_result(
        self, test_code: str, raw_scores: dict, result_type: str
    ) -> dict:
        """개별 검사 결과를 AI로 분석합니다."""
        prompt = self._build_test_analysis_prompt(test_code, raw_scores, result_type)

        response = await self._call_ai(prompt, system_prompt=SYSTEM_PROMPTS["test_analysis"])

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"analysis": response, "raw": True}

    async def analyze_all_abilities(
        self, abilities: list[dict], test_results: list[dict]
    ) -> dict:
        """전체 능력치를 종합적으로 AI로 분석합니다."""
        prompt = self._build_ability_analysis_prompt(abilities, test_results)

        response = await self._call_ai(prompt, system_prompt=SYSTEM_PROMPTS["ability_analysis"])

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"analysis": response, "raw": True}

    async def generate_report(
        self,
        user_info: dict,
        abilities: list[dict],
        test_results: list[dict],
        report_type: str = "basic"
    ) -> dict:
        """종합 리포트를 생성합니다."""
        prompt = self._build_report_prompt(user_info, abilities, test_results, report_type)
        system = SYSTEM_PROMPTS[f"report_{report_type}"]

        response = await self._call_ai(prompt, system_prompt=system, max_tokens=4000)

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"content": response, "raw": True}

    async def generate_career_recommendations(
        self, abilities: list[dict], test_results: list[dict]
    ) -> dict:
        """직업 추천을 생성합니다."""
        prompt = self._build_career_prompt(abilities, test_results)

        response = await self._call_ai(prompt, system_prompt=SYSTEM_PROMPTS["career"])

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"recommendations": response, "raw": True}

    async def generate_growth_roadmap(
        self, abilities: list[dict], goals: list[str] = None
    ) -> dict:
        """성장 로드맵을 생성합니다."""
        prompt = self._build_growth_prompt(abilities, goals)

        response = await self._call_ai(prompt, system_prompt=SYSTEM_PROMPTS["growth"])

        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"roadmap": response, "raw": True}

    async def _call_ai(
        self,
        prompt: str,
        system_prompt: str = "",
        max_tokens: int = 2000
    ) -> str:
        """AI API를 호출합니다. Anthropic 우선, 실패 시 OpenAI 사용."""

        # Try Anthropic first
        if self.anthropic:
            try:
                response = self.anthropic.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
            except Exception as e:
                print(f"Anthropic API error: {e}")

        # Fallback to OpenAI
        if self.openai:
            try:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                response = self.openai.chat.completions.create(
                    model="gpt-4-turbo-preview",
                    messages=messages,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"}
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"OpenAI API error: {e}")

        # No API available - return default response
        return json.dumps({
            "error": "AI 서비스를 사용할 수 없습니다.",
            "message": "API 키를 확인해주세요."
        })

    def _build_test_analysis_prompt(
        self, test_code: str, raw_scores: dict, result_type: str
    ) -> str:
        """검사별 분석 프롬프트를 생성합니다."""
        test_names = {
            "mbti": "MBTI 성격 유형 검사",
            "disc": "DISC 행동 유형 검사",
            "enneagram": "에니어그램 성격 검사",
            "tci": "TCI 기질 및 성격 검사",
            "gallup": "Gallup 강점 검사",
            "holland": "Holland 직업 흥미 검사",
            "iq": "IQ 지능 검사",
            "mmpi": "MMPI 다면적 인성 검사",
            "tarot": "타로 성격 검사",
            "htp": "HTP 그림 심리 검사",
            "saju": "사주 분석",
            "sasang": "사상체질 검사",
            "face": "관상 분석",
            "blood": "혈액형 성격 분석",
        }

        test_name = test_names.get(test_code, test_code)

        return f"""다음 {test_name} 결과를 분석해주세요.

## 검사 결과
- 유형: {result_type}
- 상세 점수: {json.dumps(raw_scores, ensure_ascii=False, indent=2)}

## 분석 요청
1. 이 결과가 의미하는 성격/특성 요약
2. 강점 3가지
3. 개선 영역 2가지
4. 대인관계 스타일
5. 업무 스타일
6. 추천 활동/환경

JSON 형식으로 응답해주세요:
{{
  "summary": "결과 요약",
  "strengths": ["강점1", "강점2", "강점3"],
  "growth_areas": ["영역1", "영역2"],
  "relationship_style": "대인관계 스타일",
  "work_style": "업무 스타일",
  "recommendations": ["추천1", "추천2", "추천3"]
}}"""

    def _build_ability_analysis_prompt(
        self, abilities: list[dict], test_results: list[dict]
    ) -> str:
        """능력치 분석 프롬프트를 생성합니다."""
        # 카테고리별로 그룹화
        categories = {}
        for ability in abilities:
            cat = ability.get("category", "기타")
            if cat not in categories:
                categories[cat] = []
            categories[cat].append({
                "name": ability.get("name"),
                "score": ability.get("score"),
                "max": ability.get("max_score", 20),
            })

        return f"""다음 30개 능력치 분석 결과를 종합적으로 해석해주세요.

## 능력치 점수 (카테고리별)
{json.dumps(categories, ensure_ascii=False, indent=2)}

## 완료한 검사
{[r.get("test_code") for r in test_results]}

## 분석 요청
1. 전체적인 프로필 요약
2. 가장 두드러진 강점 (상위 5개)
3. 개발이 필요한 영역 (하위 3개)
4. 강점과 약점의 밸런스 분석
5. 성장을 위한 제안

JSON 형식으로 응답해주세요:
{{
  "profile_summary": "전체 프로필 요약",
  "top_strengths": [{{"name": "능력명", "score": 점수, "insight": "인사이트"}}],
  "development_areas": [{{"name": "능력명", "score": 점수, "suggestion": "제안"}}],
  "balance_analysis": "균형 분석",
  "growth_suggestions": ["제안1", "제안2", "제안3"]
}}"""

    def _build_report_prompt(
        self,
        user_info: dict,
        abilities: list[dict],
        test_results: list[dict],
        report_type: str
    ) -> str:
        """리포트 생성 프롬프트를 생성합니다."""

        detail_level = {
            "basic": "간략한",
            "pro": "상세한",
            "premium": "매우 상세한"
        }.get(report_type, "간략한")

        return f"""다음 검사 결과를 바탕으로 {detail_level} 종합 리포트를 작성해주세요.

## 사용자 정보
{json.dumps(user_info, ensure_ascii=False, indent=2)}

## 30개 능력치
{json.dumps(abilities[:15], ensure_ascii=False, indent=2)}
... (총 30개)

## 검사 결과
{json.dumps(test_results, ensure_ascii=False, indent=2)}

## 리포트 요청 ({report_type.upper()})
1. 종합 프로필 요약
2. 핵심 성격 특성
3. 강점과 잠재력
4. 성장 기회
5. 관계 스타일
6. 직업 적합성
{"7. 상세 분석" if report_type != "basic" else ""}
{"8. 1:1 맞춤 조언" if report_type == "premium" else ""}
{"9. 장기 성장 로드맵" if report_type == "premium" else ""}

JSON 형식으로 응답해주세요."""

    def _build_career_prompt(self, abilities: list[dict], test_results: list[dict]) -> str:
        """직업 추천 프롬프트를 생성합니다."""
        return f"""다음 능력치와 검사 결과를 바탕으로 적합한 직업을 추천해주세요.

## 능력치 (상위 10개)
{json.dumps(sorted(abilities, key=lambda x: x.get("score", 0), reverse=True)[:10], ensure_ascii=False, indent=2)}

## 검사 결과 유형
{json.dumps([{"test": r.get("test_code"), "type": r.get("result_type")} for r in test_results], ensure_ascii=False)}

## 추천 요청
1. 가장 적합한 직업 5개 (적합도 점수 포함)
2. 각 직업에 대한 이유
3. 해당 직업에서 성공하기 위한 조언
4. 피해야 할 직업 유형
5. 창업 적합성

JSON 형식으로 응답해주세요:
{{
  "top_careers": [
    {{"career": "직업명", "fit_score": 95, "reason": "이유", "advice": "조언"}}
  ],
  "avoid_careers": ["직업1", "직업2"],
  "entrepreneurship": {{"score": 80, "type": "창업 유형", "advice": "조언"}}
}}"""

    def _build_growth_prompt(self, abilities: list[dict], goals: list[str] = None) -> str:
        """성장 로드맵 프롬프트를 생성합니다."""
        goals_text = ", ".join(goals) if goals else "전반적인 성장"

        return f"""다음 능력치를 바탕으로 성장 로드맵을 작성해주세요.

## 현재 능력치
{json.dumps(abilities, ensure_ascii=False, indent=2)}

## 목표
{goals_text}

## 로드맵 요청
1. 단기 목표 (1-3개월)
2. 중기 목표 (3-6개월)
3. 장기 목표 (6-12개월)
4. 각 단계별 구체적인 실행 방안
5. 추천 자료/활동

JSON 형식으로 응답해주세요:
{{
  "short_term": [{{"goal": "목표", "actions": ["행동1", "행동2"], "expected_improvement": "예상 개선"}}],
  "mid_term": [...],
  "long_term": [...],
  "resources": [{{"type": "책/강의/활동", "name": "이름", "reason": "추천 이유"}}]
}}"""


# 시스템 프롬프트
SYSTEM_PROMPTS = {
    "test_analysis": """당신은 심리검사 전문가입니다.
검사 결과를 정확하고 긍정적인 관점에서 해석합니다.
과학적 근거에 기반하되, 이해하기 쉬운 언어로 설명합니다.
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",

    "ability_analysis": """당신은 인재 평가 전문가입니다.
30개 능력치를 종합적으로 분석하여 개인의 강점과 성장 기회를 파악합니다.
균형 잡힌 시각으로 분석하되, 성장 가능성에 초점을 맞춥니다.
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",

    "report_basic": """당신은 인재 평가 리포트 작성 전문가입니다.
기본(Basic) 리포트를 작성합니다. 핵심 내용만 간결하게 포함합니다.
- 프로필 요약 (2-3문장)
- 핵심 강점 3가지
- 성장 기회 2가지
- 간단한 직업 추천
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",

    "report_pro": """당신은 인재 평가 리포트 작성 전문가입니다.
프로(Pro) 리포트를 작성합니다. 상세한 분석을 포함합니다.
- 상세 프로필 분석
- 강점과 잠재력 분석
- 성장 영역 분석
- 관계 스타일 분석
- 업무 스타일 분석
- 상세 직업 추천
- 성장을 위한 조언
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",

    "report_premium": """당신은 인재 평가 리포트 작성 전문가입니다.
프리미엄(Premium) 리포트를 작성합니다. 매우 상세하고 맞춤화된 분석을 포함합니다.
- 깊이 있는 프로필 분석
- 강점/잠재력/성장영역 상세 분석
- 관계/업무/리더십 스타일 분석
- 맞춤형 직업 추천 (10개 이상)
- 1:1 맞춤 조언
- 장기 성장 로드맵 (1년 계획)
- 자기계발 자료 추천
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",

    "career": """당신은 진로/직업 상담 전문가입니다.
개인의 능력치와 성격 특성을 바탕으로 최적의 직업을 추천합니다.
현실적이고 구체적인 조언을 제공합니다.
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",

    "growth": """당신은 자기계발 코치입니다.
개인의 현재 능력치를 바탕으로 실행 가능한 성장 로드맵을 작성합니다.
단계별로 구체적인 행동 계획을 제시합니다.
모든 응답은 한국어로 제공하며, 반드시 유효한 JSON 형식으로 응답합니다.""",
}


# 싱글톤 인스턴스
_ai_service: Optional[AIAnalysisService] = None


def get_ai_service() -> AIAnalysisService:
    """AI 분석 서비스 인스턴스를 반환합니다."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIAnalysisService()
    return _ai_service
