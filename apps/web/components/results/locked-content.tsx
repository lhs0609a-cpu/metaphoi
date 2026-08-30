'use client';

interface LockedContentProps {
  title: string;
  items?: string[];
}

/**
 * 잠긴 섹션.
 *
 * 내용을 흐릿하게 깔아 두고 "보일 듯 말 듯" 하게 만들지 않는다.
 * 무엇이 들어 있는지 글자로 정확히 적는 편이 결제 판단에 도움이 되고,
 * 흐린 글자를 눈으로 해독하려는 헛수고를 시키지 않는다.
 */
export function LockedContent({ title, items }: LockedContentProps) {
  const listed = items ?? ['상세 해석', '개인화된 추천', '실행 가이드'];

  return (
    <div className="rounded-card border border-dashed border-border px-5 py-4">
      <div className="flex items-center gap-2">
        <svg
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <rect x="3.25" y="7" width="9.5" height="6.25" rx="1.5" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
        </svg>
        <h3 className="text-body font-semibold">{title}</h3>
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {listed.map((item) => (
          <li key={item} className="flex items-start gap-2 text-small text-muted-foreground">
            <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
