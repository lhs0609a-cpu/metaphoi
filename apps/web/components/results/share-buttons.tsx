'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  title: string;
  description: string;
  url?: string;
}

export function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKakaoShare = () => {
    if (typeof window === 'undefined') return;

    const kakao = (window as any).Kakao;
    if (!kakao) {
      alert('카카오톡 SDK를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!kakao.isInitialized()) {
      kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '');
    }

    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/og-image.png`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '나도 검사하기',
          link: {
            mobileWebUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/test`,
            webUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/test`,
          },
        },
      ],
    });
  };

  const handleTwitterShare = () => {
    const text = `${title}\n${description}\n\n나도 검사해보기:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
        // 사용자가 취소한 경우
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-muted-foreground">결과 공유하기</p>
      <div className="flex gap-2">
        {/* 카카오톡 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleKakaoShare}
          className="gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.96 3.61-1 3.78 0 .09.03.17.09.22a.27.27 0 00.24.03c.31-.04 3.64-2.38 4.22-2.79.58.09 1.18.13 1.79.13 5.52 0 10-3.58 10-7.94S17.52 3 12 3z" />
          </svg>
          카카오톡
        </Button>

        {/* 트위터/X */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTwitterShare}
          className="gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </Button>

        {/* 링크 복사 */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? '복사됨!' : '링크 복사'}
        </Button>

        {/* 네이티브 공유 (모바일) */}
        {hasNativeShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            공유
          </Button>
        )}
      </div>
    </div>
  );
}
