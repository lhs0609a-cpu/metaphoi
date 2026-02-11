'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompanyCandidatesPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const [seekers, setSeekers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/company/login');
      return;
    }

    marketplaceApi.seekers.search().then((res) => {
      setSeekers((res.data as any)?.seekers || []);
      setLoading(false);
    });
  }, [isAuthenticated, router]);

  const handleInterest = async (seekerId: string) => {
    if (!token) return;
    const result = await marketplaceApi.matching.sendCompanyInterest(
      { to_type: 'seeker', to_id: seekerId },
      token,
    );
    if (result.error) {
      alert(result.error);
    } else if ((result.data as any)?.match) {
      alert('매칭이 성사되었습니다!');
    } else {
      alert('관심 표시를 보냈습니다');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-2">
            <Link href="/company/pipeline"><Button variant="outline" size="sm">파이프라인</Button></Link>
            <Link href="/company/messages"><Button variant="outline" size="sm">메시지</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">후보자 탐색</h1>
        <p className="text-muted-foreground mb-8">관심 있는 후보자에게 관심 표시를 보내보세요</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : seekers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              현재 활성 구직자가 없습니다
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {seekers.map((seeker) => {
              const topAbilities = (seeker.abilities_snapshot || [])
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 3);

              return (
                <Card key={seeker.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold">{seeker.display_name || '익명'}</h3>
                        <p className="text-sm text-muted-foreground">{seeker.headline || ''}</p>

                        <div className="flex gap-2 mt-2">
                          {(seeker.desired_roles || []).slice(0, 3).map((r: string) => (
                            <span key={r} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{r}</span>
                          ))}
                          {seeker.experience_years != null && (
                            <span className="px-2 py-0.5 bg-muted text-xs rounded-full">{seeker.experience_years}년차</span>
                          )}
                        </div>

                        {topAbilities.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {topAbilities.map((a: any) => (
                              <div key={a.key} className="flex items-center gap-2 text-xs">
                                <span className="w-16 text-muted-foreground">{a.name}</span>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${a.score}%` }} />
                                </div>
                                <span className="font-medium">{a.score}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/company/candidates/${seeker.id}`}>
                          <Button size="sm" variant="outline">상세</Button>
                        </Link>
                        <Button size="sm" onClick={() => handleInterest(seeker.id)}>
                          관심 표시
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
