import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Metaphoi - 종합 인재 평가 플랫폼',
    short_name: 'Metaphoi',
    description:
      '14가지 성격/심리 검사를 통합하여 30개 능력치 스탯을 산출하는 AI 기반 인재 평가 플랫폼',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
