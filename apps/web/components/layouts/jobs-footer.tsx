import Link from 'next/link';

export function JobsFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-3">구직자</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/jobs" className="hover:text-primary">채용공고</Link></li>
              <li><Link href="/jobs/companies" className="hover:text-primary">기업정보</Link></li>
              <li><Link href="/seeker/register" className="hover:text-primary">프로필 등록</Link></li>
              <li><Link href="/start" className="hover:text-primary">무료 검사</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">기업</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/company/register" className="hover:text-primary">기업 가입</Link></li>
              <li><Link href="/enterprise" className="hover:text-primary">기업 솔루션</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">서비스 소개</Link></li>
              <li><Link href="/start" className="hover:text-primary">심리검사</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">계정</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-primary">로그인</Link></li>
              <li><Link href="/signup" className="hover:text-primary">회원가입</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Metaphoi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
