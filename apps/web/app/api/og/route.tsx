import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/*
 * 공유 이미지.
 *
 * 예전에는 layout 의 metadata 가 /og-image.png 를 가리켰는데 public 디렉터리
 * 자체가 없어서 카카오톡·트위터 공유가 전부 깨진 이미지로 나갔다.
 * 이제 이 라우트가 그 자리를 대신한다.
 *
 * 디자인은 제품 화면과 같은 규칙을 따른다. 배경은 잉크, 강조는 시그널 청록,
 * 능력 카테고리 5색은 데이터에만. 공유 이미지만 다른 팔레트를 쓰면
 * 링크를 타고 들어온 사람이 다른 서비스에 온 것처럼 느낀다.
 */

const INK = '#0d1117';
const INK_SOFT = '#161b22';
const SIGNAL = '#22b8cf';
const TEXT = '#f2f5f6';
const MUTED = '#8b949e';

// 능력 카테고리 5색 — globals.css 의 --cat-* 와 같은 값
const CATEGORY = [
  { name: '정신력', color: '#5b57d9', value: 78 },
  { name: '사회성', color: '#25a37f', value: 54 },
  { name: '업무역량', color: '#eb8c0f', value: 71 },
  { name: '신체/감각', color: '#d93d63', value: 46 },
  { name: '잠재력', color: '#9d5cd6', value: 83 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || '성격검사 7개를 겹쳐 능력치 30개로';
  const name = searchParams.get('name') || '';
  const mbti = searchParams.get('mbti') || '';
  const disc = searchParams.get('disc') || '';
  const enneagram = searchParams.get('enneagram') || '';

  const badges = [
    { label: 'MBTI', value: mbti },
    { label: 'DISC', value: disc },
    { label: '에니어그램', value: enneagram },
  ].filter((b) => b.value);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: INK,
          fontFamily: 'sans-serif',
          padding: 64,
        }}
      >
        {/* 왼쪽 — 말 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 620,
            paddingRight: 48,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                color: SIGNAL,
                letterSpacing: -0.5,
              }}
            >
              Metaphoi
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: name ? 52 : 58,
                fontWeight: 800,
                color: TEXT,
                lineHeight: 1.2,
                letterSpacing: -2,
                marginTop: 28,
              }}
            >
              {name ? `${name}님의 결과` : title}
            </div>

            {name ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 26,
                  color: MUTED,
                  marginTop: 16,
                  lineHeight: 1.4,
                }}
              >
                {title}
              </div>
            ) : null}
          </div>

          {badges.length > 0 ? (
            <div style={{ display: 'flex', gap: 12 }}>
              {badges.map((b) => (
                <div
                  key={b.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: INK_SOFT,
                    borderRadius: 14,
                    padding: '14px 20px',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: 13, color: MUTED }}>{b.label}</div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 26,
                      fontWeight: 700,
                      color: TEXT,
                      marginTop: 4,
                    }}
                  >
                    {b.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', fontSize: 20, color: MUTED }}>
              53문항 · 약 12분 · 회원가입 없이
            </div>
          )}
        </div>

        {/* 오른쪽 — 결과 카드. 추상 그래픽 대신 실제로 받는 화면을 보여준다 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: INK_SOFT,
            borderRadius: 24,
            padding: 36,
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', fontSize: 15, color: MUTED, marginBottom: 24 }}>
            능력치 요약
          </div>

          {CATEGORY.map((c) => (
            <div
              key={c.name}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}
            >
              <div style={{ display: 'flex', width: 92, fontSize: 17, color: MUTED }}>
                {c.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  height: 8,
                  backgroundColor: '#21262d',
                  borderRadius: 999,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: `${c.value}%`,
                    height: 8,
                    backgroundColor: c.color,
                    borderRadius: 999,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  width: 46,
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT,
                  justifyContent: 'flex-end',
                }}
              >
                {c.value}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', fontSize: 13, color: MUTED, marginTop: 12 }}>
            규준 수집 전 · 내부 상대 점수
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
