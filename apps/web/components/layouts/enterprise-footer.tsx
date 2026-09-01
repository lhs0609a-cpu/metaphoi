import Link from 'next/link';

export function EnterpriseFooter() {
  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        {/* 기업 화면에서도 이 고지를 눈에 띄는 곳에 둔다.
            채용 담당자가 가장 잘못 쓸 수 있는 제품이기 때문이다 */}
        <p className="max-w-[52ch] text-tiny leading-relaxed text-muted-foreground">
          매칭 점수는 정렬을 돕는 참고 지표입니다. 가중치는 아직 준거 타당도가 검증되지 않은
          설정값이며, 자동 산출된 점수만으로 불합격을 결정해서는 안 됩니다. 지원자는 자동화된
          평가에 대해 설명과 사람의 재검토를 요청할 수 있습니다.
        </p>

        <nav className="flex shrink-0 flex-wrap gap-x-6 gap-y-2">
          {[
            { href: '/', label: '개인 검사' },
            { href: '/jobs', label: '채용' },
            { href: '/company/login', label: '로그인' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-small text-muted-foreground transition-colors duration-fast hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="shell border-t border-border py-5">
        <p className="text-tiny text-muted-foreground">© {new Date().getFullYear()} Metaphoi</p>
      </div>
    </footer>
  );
}
