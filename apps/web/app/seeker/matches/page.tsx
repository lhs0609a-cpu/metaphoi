'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function SeekerMatchesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();

  const [matches, setMatches] = useState<any[]>([]);
  const [sentInterests, setSentInterests] = useState<any[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'matches' | 'sent' | 'received'>('matches');

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    Promise.all([
      marketplaceApi.matching.getSeekerMatches(token),
      marketplaceApi.matching.getSeekerSentInterests(token),
      marketplaceApi.matching.getSeekerReceivedInterests(token),
    ]).then(([matchRes, sentRes, recvRes]) => {
      setMatches(Array.isArray(matchRes.data) ? matchRes.data : []);
      setSentInterests(Array.isArray(sentRes.data) ? sentRes.data : []);
      setReceivedInterests(Array.isArray(recvRes.data) ? recvRes.data : []);
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  const handleAcceptInterest = async (interestId: string) => {
    if (!token) return;
    const result = await marketplaceApi.matching.respondInterest(interestId, { status: 'accepted' }, token);
    if ((result.data as any)?.match) {
      alert('매칭이 성사되었습니다!');
    }
    // 새로고침
    window.location.reload();
  };

  const handleDeclineInterest = async (interestId: string) => {
    if (!token) return;
    await marketplaceApi.matching.respondInterest(interestId, { status: 'declined' }, token);
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/seeker/profile"><Button variant="outline" size="sm">프로필</Button></Link>
            <Link href="/seeker/companies"><Button variant="outline" size="sm">기업 탐색</Button></Link>
            <Link href="/seeker/messages"><Button variant="outline" size="sm">메시지</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">매칭 & 관심</h1>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          {(['matches', 'received', 'sent'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
              }`}
            >
              {t === 'matches' ? `매칭 (${matches.length})` : t === 'received' ? `받은 관심 (${receivedInterests.length})` : `보낸 관심 (${sentInterests.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : (
          <>
            {/* 매칭 */}
            {tab === 'matches' && (
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      아직 매칭이 없습니다. 기업에 관심 표시를 해보세요!
                    </CardContent>
                  </Card>
                ) : matches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{match.companies?.name || '기업'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {match.job_postings?.title || ''} · 핏 {match.fit_score?.total || 0}%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/seeker/messages`}>
                            <Button size="sm" variant="outline">메시지</Button>
                          </Link>
                          <Link href={`/seeker/applications`}>
                            <Button size="sm">지원하기</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 받은 관심 */}
            {tab === 'received' && (
              <div className="space-y-4">
                {receivedInterests.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      받은 관심이 없습니다
                    </CardContent>
                  </Card>
                ) : receivedInterests.map((interest) => (
                  <Card key={interest.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">기업에서 관심을 보냈습니다</p>
                          {interest.message && (
                            <p className="text-sm text-muted-foreground mt-1">{interest.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {interest.status === 'pending' ? '대기중' : interest.status}
                          </p>
                        </div>
                        {interest.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAcceptInterest(interest.id)}>수락</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeclineInterest(interest.id)}>거절</Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* 보낸 관심 */}
            {tab === 'sent' && (
              <div className="space-y-4">
                {sentInterests.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      보낸 관심이 없습니다
                    </CardContent>
                  </Card>
                ) : sentInterests.map((interest) => (
                  <Card key={interest.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {interest.job_postings?.title || '기업'}에 관심 표시
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {interest.status === 'pending' ? '대기중' : interest.status === 'accepted' ? '수락됨' : '거절됨'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          interest.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          interest.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {interest.status === 'pending' ? '대기' : interest.status === 'accepted' ? '수락' : '거절'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
