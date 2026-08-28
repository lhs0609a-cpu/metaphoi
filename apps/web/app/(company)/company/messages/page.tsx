'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ChatWindow } from '@/components/messages/chat-window';
import { EmptyState, Skeleton } from '@/components/ui/states';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';
import { cn } from '@/lib/utils';

interface Conversation {
  match_id: string;
  seeker?: { display_name?: string };
  job_title?: string;
  unread_count?: number;
  last_message?: { content?: string; created_at?: string };
}

/**
 * 기업 메시지 — 목록 + 대화 2단 구성.
 *
 * 모바일에서는 두 영역을 한 화면에 넣을 수 없다. 목록을 먼저 보여주고
 * 선택하면 대화로 전환한다. 데스크톱에서는 나란히 둔다.
 */
export default function CompanyMessagesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }
    marketplaceApi.messages.getCompanyConversations(token).then((res) => {
      setConversations(Array.isArray(res.data) ? (res.data as Conversation[]) : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  useEffect(() => {
    if (!selectedMatchId || !token) return;

    const fetchMessages = () => {
      marketplaceApi.messages.getCompanyMessages(selectedMatchId, token).then((res) => {
        setMessages(Array.isArray(res.data) ? res.data : []);
      });
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedMatchId, token]);

  const handleSend = async (content: string) => {
    if (!token || !selectedMatchId) return;
    await marketplaceApi.messages.sendCompanyMessage(selectedMatchId, content, token);
    const res = await marketplaceApi.messages.getCompanyMessages(selectedMatchId, token);
    setMessages(Array.isArray(res.data) ? res.data : []);
  };

  const selected = conversations.find((c) => c.match_id === selectedMatchId);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4">
      {/* 대화 목록 */}
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col overflow-hidden rounded-card border border-border bg-card md:w-80',
          selectedMatchId && 'hidden md:flex',
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-body font-semibold">메시지</h1>
          {conversations.length > 0 ? (
            <span className="stat-num text-tiny text-muted-foreground">{conversations.length}</span>
          ) : null}
        </header>

        <div className="scroll-x flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="아직 대화가 없습니다"
                description="후보자와 매칭이 성사되면 여기서 대화를 시작할 수 있습니다."
                action={{ label: '후보자 탐색', href: '/company/candidates' }}
                className="border-0 px-0 py-6"
              />
            </div>
          ) : (
            conversations.map((conv) => {
              const active = selectedMatchId === conv.match_id;
              return (
                <button
                  key={conv.match_id}
                  type="button"
                  onClick={() => setSelectedMatchId(conv.match_id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left',
                    'transition-colors duration-fast hover:bg-secondary/60',
                    active && 'bg-accent',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-small font-semibold">
                      {conv.seeker?.display_name || '후보자'}
                    </span>
                    {conv.unread_count ? (
                      <span className="stat-num flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1 text-micro text-primary-foreground">
                        {conv.unread_count}
                      </span>
                    ) : null}
                  </span>
                  {conv.job_title ? (
                    <span className="truncate text-micro text-muted-foreground">{conv.job_title}</span>
                  ) : null}
                  {conv.last_message?.content ? (
                    <span className="truncate text-tiny text-muted-foreground">
                      {conv.last_message.content}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 대화 */}
      <section
        className={cn(
          'flex flex-1 flex-col overflow-hidden rounded-card border border-border bg-card',
          !selectedMatchId && 'hidden md:flex',
        )}
      >
        {selectedMatchId ? (
          <>
            <header className="flex items-center gap-2 border-b border-border px-4 py-3 md:hidden">
              <button
                type="button"
                onClick={() => setSelectedMatchId(null)}
                className="inline-flex items-center gap-1.5 text-small text-muted-foreground"
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 3 5 8l5 5" />
                </svg>
                목록
              </button>
              <span className="text-small font-semibold">
                {selected?.seeker?.display_name || '후보자'}
              </span>
            </header>

            <ChatWindow
              messages={messages as never[]}
              currentSenderType="company"
              onSend={handleSend}
              partnerName={selected?.seeker?.display_name || '후보자'}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="text-small text-muted-foreground">왼쪽에서 대화를 선택하세요</p>
          </div>
        )}
      </section>
    </div>
  );
}
