import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || '나의 종합 심리검사 결과';
  const mbti = searchParams.get('mbti') || '';
  const disc = searchParams.get('disc') || '';
  const enneagram = searchParams.get('enneagram') || '';
  const holland = searchParams.get('holland') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            fontWeight: 700,
            color: '#818cf8',
            marginBottom: 20,
          }}
        >
          Metaphoi
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>

        {/* Type badges */}
        {(mbti || disc || enneagram || holland) && (
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 40,
            }}
          >
            {[
              { label: 'MBTI', value: mbti },
              { label: 'DISC', value: disc },
              { label: '에니어그램', value: enneagram },
              { label: 'Holland', value: holland },
            ]
              .filter((b) => b.value)
              .map((badge) => (
                <div
                  key={badge.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'rgba(129, 140, 248, 0.2)',
                    borderRadius: 16,
                    padding: '16px 24px',
                  }}
                >
                  <div style={{ fontSize: 14, color: '#94a3b8' }}>{badge.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#818cf8' }}>
                    {badge.value}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            color: '#94a3b8',
            marginTop: 40,
          }}
        >
          7가지 심리검사 종합 분석 | 53문항 | 30가지 능력치
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
