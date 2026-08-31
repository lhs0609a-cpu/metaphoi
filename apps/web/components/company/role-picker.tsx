'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RESOLVED_ROLES, requiredAbilitiesForRole, type ResolvedRole } from '@/lib/role-matching';
import { ABILITY_NAME } from '@/lib/abilities-scoring';
import { INDUSTRIES } from '@/data/roles/families';
import { cn } from '@/lib/utils';

interface RolePickerProps {
  value?: string;
  /** 직무를 고르면 요구 능력치 초안을 함께 넘긴다 */
  onSelect: (role: ResolvedRole, draft: Record<string, { min: number }>) => void;
  onClear: () => void;
}

/**
 * 직무를 골라 요구 능력치를 채운다.
 *
 * 빈 체크박스 30개를 주고 알아서 고르라고 하면, 담당자는 자기 직무에
 * 무엇이 중요한지를 그 자리에서 새로 정의해야 한다. 그래서 대부분
 * 눈에 익은 것 몇 개를 찍고 넘어간다. 직무를 먼저 고르게 하면 초안이
 * 채워지고, 담당자는 "고르는 일" 대신 "고치는 일"을 하면 된다.
 */
export function RolePicker({ value, onSelect, onClear }: RolePickerProps) {
  const [query, setQuery] = useState('');
  const [industryId, setIndustryId] = useState<string | null>(null);

  const selected = useMemo(
    () => (value ? RESOLVED_ROLES.find((r) => r.id === value) ?? null : null),
    [value]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool = RESOLVED_ROLES;
    if (industryId) pool = pool.filter((r) => r.industryId === industryId);
    if (q) {
      pool = pool.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.familyName.toLowerCase().includes(q) ||
          r.aliases.some((a) => a.toLowerCase().includes(q))
      );
    }
    return pool.slice(0, q || industryId ? 24 : 0);
  }, [query, industryId]);

  if (selected) {
    const draft = requiredAbilitiesForRole(selected.id);
    return (
      <div className="rounded-card border border-border bg-sunk px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-body font-semibold">{selected.name}</span>
              <span className="text-tiny text-muted-foreground">
                {selected.industryName} · {selected.familyName}
              </span>
            </div>
            <p className="mt-1 text-small text-muted-foreground">{selected.summary}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClear} className="shrink-0">
            바꾸기
          </Button>
        </div>

        {draft && Object.keys(draft.abilities).length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">자동으로 채운 요구 능력치</p>
              {/* 근거의 질을 숨기지 않는다 */}
              {draft.source === 'provisional' && (
                <Badge tone="warn" size="sm">
                  잠정값
                </Badge>
              )}
            </div>
            <p className="mt-2 text-tiny leading-relaxed text-muted-foreground">
              {Object.keys(draft.abilities)
                .map((k) => ABILITY_NAME[k] ?? k)
                .join(' · ')}
            </p>
            {draft.source === 'provisional' && (
              <p className="mt-2 text-micro leading-relaxed text-muted-foreground">
                이 직무의 역량 중요도는 아직 실측 데이터로 검증되지 않은 초안입니다.
                아래에서 직접 고쳐 주세요 — 고치신 값이 이 공고에 쓰입니다.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="직무명으로 검색 — 예: 백엔드, 그로스 마케터, 간호사"
        aria-label="직무 검색"
        leading={
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3 3" strokeLinecap="round" />
          </svg>
        }
      />

      <div className="scroll-x flex gap-1.5 pb-1">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.id}
            type="button"
            onClick={() => setIndustryId(industryId === ind.id ? null : ind.id)}
            className={cn(
              'shrink-0 rounded-pill border px-3 py-1.5 text-tiny font-medium transition-colors duration-fast',
              industryId === ind.id
                ? 'border-action bg-action text-action-foreground'
                : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
            )}
          >
            {ind.name}
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <ul className="max-h-72 overflow-y-auto rounded-card border border-border">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  const draft = requiredAbilitiesForRole(r.id);
                  const mapped: Record<string, { min: number }> = {};
                  Object.entries(draft?.abilities ?? {}).forEach(([k, v]) => {
                    mapped[k] = { min: v as number };
                  });
                  onSelect(r, mapped);
                }}
                className="flex w-full items-baseline gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-sunk"
              >
                <span className="text-small font-medium">{r.name}</span>
                <span className="truncate text-tiny text-muted-foreground">
                  {r.industryName} · {r.familyName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : query || industryId ? (
        <p className="text-small text-muted-foreground">
          맞는 직무가 없습니다. 업종을 바꾸거나 다른 이름으로 검색해 보세요.
        </p>
      ) : (
        <p className="text-small text-muted-foreground">
          업종을 고르거나 직무명을 입력하면 목록이 나옵니다.
        </p>
      )}
    </div>
  );
}
