import Link from 'next/link';
import { LogoMark } from './logo';

const GROUPS = [
  {
    title: '개인',
    links: [
      { href: '/start', label: '검사하기' },
      { href: '/seeker/register', label: '프로필 등록' },
      { href: '/jobs', label: '채용 공고' },
    ],
  },
  {
    title: '기업',
    links: [
      { href: '/enterprise', label: '기업 서비스' },
      { href: '/company/register', label: '기업 가입' },
      { href: '/company/login', label: '담당자 로그인' },
    ],
  },
];

export function IntroFooter() {
  return (
    <footer className="border-t border-border">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] lg:gap-20">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 text-body font-bold">
            <LogoMark className="h-5 w-5 text-primary" />
            Metaphoi
          </Link>
          {/* 푸터에서도 한 번 더 말해 둔다. 눈에 띄지 않는 곳에 두면 숨긴 것이 된다 */}
          <p className="max-w-[38ch] text-tiny leading-relaxed text-muted-foreground">
            검사 결과는 성격 경향을 재는 참고 지표입니다. 규준 표본이 쌓이기 전까지 점수는
            모집단 대비 백분위가 아니라 내부 상대 점수로 표시됩니다.
          </p>
        </div>

        {GROUPS.map((g) => (
          <nav key={g.title} className="flex flex-col gap-3">
            <p className="eyebrow">{g.title}</p>
            <ul className="flex flex-col gap-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-small text-muted-foreground transition-colors duration-fast hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-tiny text-muted-foreground">
          © {new Date().getFullYear()} Metaphoi
        </p>
        <p className="text-tiny text-muted-foreground">
          자동 산출된 평가에 대해 설명과 사람의 재검토를 요청할 수 있습니다
        </p>
      </div>
    </footer>
  );
}
