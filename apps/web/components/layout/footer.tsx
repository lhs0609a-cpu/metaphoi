import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Metaphoi</h3>
            <p className="text-sm text-muted-foreground">
              AI 기반 종합 인재 평가 플랫폼
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">검사</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/mbti" className="hover:text-foreground">MBTI</Link></li>
              <li><Link href="/disc" className="hover:text-foreground">DISC</Link></li>
              <li><Link href="/enneagram" className="hover:text-foreground">에니어그램</Link></li>
              <li><Link href="/gallup" className="hover:text-foreground">Gallup 강점</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/abilities" className="hover:text-foreground">능력치 분석</Link></li>
              <li><Link href="/reports" className="hover:text-foreground">AI 리포트</Link></li>
              <li><Link href="/checkout" className="hover:text-foreground">가격 안내</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-foreground">자주 묻는 질문</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">문의하기</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">개인정보처리방침</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">이용약관</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Metaphoi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
