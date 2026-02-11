'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChatWindow } from '@/components/messages/chat-window';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function SeekerMessagesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    marketplaceApi.messages.getSeekerConversations(token).then((res) => {
      setConversations(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  useEffect(() => {
    if (!selectedMatchId || !token) return;

    marketplaceApi.messages.getSeekerMessages(selectedMatchId, token).then((res) => {
      setMessages(Array.isArray(res.data) ? res.data : []);
    });

    // 5초마다 폴링
    const interval = setInterval(() => {
      marketplaceApi.messages.getSeekerMessages(selectedMatchId, token).then((res) => {
        setMessages(Array.isArray(res.data) ? res.data : []);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedMatchId, token]);

  const handleSend = async (content: string) => {
    if (!token || !selectedMatchId) return;
    await marketplaceApi.messages.sendSeekerMessage(selectedMatchId, content, token);
    // 즉시 새로고침
    const res = await marketplaceApi.messages.getSeekerMessages(selectedMatchId, token);
    setMessages(Array.isArray(res.data) ? res.data : []);
  };

  const selectedConv = conversations.find((c) => c.match_id === selectedMatchId);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/seeker/profile"><Button variant="outline" size="sm">프로필</Button></Link>
            <Link href="/seeker/matches"><Button variant="outline" size="sm">매칭</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="flex gap-4 h-full">
          {/* 대화 목록 */}
          <div className="w-80 shrink-0 border rounded-lg overflow-y-auto">
            <div className="p-3 border-b">
              <h2 className="font-bold">메시지</h2>
            </div>
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">로딩 중...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                매칭된 기업이 있어야 메시지를 보낼 수 있습니다
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.match_id}
                  onClick={() => setSelectedMatchId(conv.match_id)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-muted transition-colors ${
                    selectedMatchId === conv.match_id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{conv.company?.name || '기업'}</p>
                    {conv.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.job_title && (
                    <p className="text-xs text-muted-foreground">{conv.job_title}</p>
                  )}
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {conv.last_message.content}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* 채팅 영역 */}
          <div className="flex-1 border rounded-lg">
            {selectedMatchId ? (
              <ChatWindow
                messages={messages}
                currentSenderType="seeker"
                onSend={handleSend}
                partnerName={selectedConv?.company?.name || '기업'}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                대화를 선택하세요
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
