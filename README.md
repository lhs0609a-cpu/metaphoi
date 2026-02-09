# Metaphoi (메타포이)

14가지 성격/심리 검사를 통합하여 30개 능력치 스탯을 산출하고, AI 분석 기반 리포트를 제공하는 종합 인재 평가 플랫폼

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Payment**: 토스페이먼츠
- **Build**: Turborepo (Monorepo)

## 프로젝트 구조

```
metaphoi/
├── apps/
│   ├── web/                    # Next.js Frontend
│   └── api/                    # FastAPI Backend
├── packages/
│   └── shared/                 # 공유 타입 및 상수
├── supabase/
│   └── migrations/             # 데이터베이스 마이그레이션
├── turbo.json
└── package.json
```

## 시작하기

### 사전 요구사항

- Node.js 18+
- Python 3.11+
- Supabase 계정

### 설치

1. 저장소 클론
```bash
cd metaphoi
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정

Frontend (`apps/web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
```

Backend (`apps/api/.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET_KEY=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
TOSS_SECRET_KEY=your_toss_secret_key
```

4. 데이터베이스 설정

Supabase Dashboard > SQL Editor에서 다음 파일을 순서대로 실행:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_data.sql`

5. Backend 설정
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 개발 서버 실행

```bash
# 전체 실행 (Turborepo)
npm run dev

# Frontend만 실행
npm run dev:web

# Backend만 실행
cd apps/api
uvicorn app.main:app --reload
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 14가지 검사

| 카테고리 | 검사 | 문항 수 |
|---------|------|--------|
| 성격 검사 | MBTI | 48 |
| 성격 검사 | DISC | 28 |
| 성격 검사 | Enneagram | 36 |
| 성격 검사 | TCI | 140 |
| 적성/역량 | Gallup 강점 | 34 |
| 적성/역량 | Holland | 42 |
| 적성/역량 | IQ 테스트 | 30 |
| 적성/역량 | MMPI 간이 | 50 |
| 전통/특수 | 타로 | 10 |
| 전통/특수 | HTP | 3 |
| 전통/특수 | 사주 | 1 |
| 전통/특수 | 사상체질 | 20 |
| 전통/특수 | 관상 | 1 |
| 전통/특수 | 혈액형 | 5 |

## 30가지 능력치

### 정신력
결단력, 침착성, 집중력, 창의성, 분석력, 적응력

### 사회성
소통능력, 협동심, 리더십, 공감능력, 영향력, 네트워킹

### 업무역량
실행력, 기획력, 문제해결, 시간관리, 꼼꼼함, 멀티태스킹

### 신체/감각
스트레스내성, 지구력, 직관력, 심미안, 공간지각, 언어능력

### 잠재력
성장가능성, 학습속도, 혁신성, 회복탄력성, 야망, 성실성

## 리포트 가격

| 티어 | 가격 | 내용 |
|-----|------|-----|
| Basic | 9,900원 | 30개 능력치, 레이더 차트, 결과 요약 |
| Pro | 29,900원 | Basic + 상세 분석, 직업 추천, PDF |
| Premium | 59,900원 | Pro + 성장 로드맵, AI 1:1 상담 |

## API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 검사
- `GET /api/tests` - 검사 목록
- `POST /api/tests/{code}/start` - 검사 시작
- `POST /api/tests/{code}/submit` - 답변 제출
- `POST /api/tests/{code}/complete` - 검사 완료

### 능력치
- `GET /api/abilities` - 전체 능력치 조회
- `GET /api/abilities/radar` - 레이더 차트 데이터

### 리포트
- `GET /api/reports/preview` - 무료 미리보기
- `POST /api/reports/generate` - 리포트 생성

### 결제
- `POST /api/payments/prepare` - 결제 준비
- `POST /api/payments/confirm` - 결제 승인

## 라이선스

MIT
