'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CandidateDetailPage() {
  const params = useParams();
  const seekerId = params.id as string;
  const { token } = useCompanyAuthStore();

  const [seeker, setSeeker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceApi.seekers.getProfile(seekerId).then((res) => {
      setSeeker(res.data);
      setLoading(false);
    });
  }, [seekerId]);

  const handleInterest = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!seeker) return null;

  const abilities = seeker.abilities_snapshot || [];
  const topAbilities = [...abilities].sort((a: any, b: any) => b.score - a.score).slice(0, 10);
  const profile = seeker.comprehensive_profile;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/company/candidates">
            <Button variant="outline" size="sm">후보자 목록</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{seeker.display_name || '익명'}</h1>
                <p className="text-muted-foreground">{seeker.headline || ''}</p>
              </div>
              <Button onClick={handleInterest}>관심 표시</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div>
                <span className="text-muted-foreground">희망 직무</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(seeker.desired_roles || []).map((r: string) => (
                    <span key={r} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">경력</span>
                <p className="font-medium">{seeker.experience_years != null ? `${seeker.experience_years}년` : '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">학력</span>
                <p className="font-medium">{seeker.education || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">희망 연봉</span>
                <p className="font-medium">{seeker.salary_range || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">근무 형태</span>
                <p className="font-medium">
                  {seeker.remote_pref === 'remote' ? '재택' : seeker.remote_pref === 'hybrid' ? '하이브리드' : seeker.remote_pref === 'onsite' ? '출근' : '-'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">선호 지역</span>
                <p className="font-medium">{seeker.location_pref || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 능력치 */}
        {topAbilities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">주요 능력치</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topAbilities.map((a: any, i: number) => (
                <div key={a.key} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary w-5">{i + 1}</span>
                  <span className="text-sm font-medium w-24 shrink-0">{a.name}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${a.score}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{a.score}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 유형 */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">유형 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.mbti && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">MBTI</p>
                    <p className="text-lg font-bold text-primary">{profile.mbti.type}</p>
                  </div>
                )}
                {profile.disc && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">DISC</p>
                    <p className="text-lg font-bold text-primary">{profile.disc.type}</p>
                  </div>
                )}
                {profile.enneagram && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">에니어그램</p>
                    <p className="text-lg font-bold text-primary">{profile.enneagram.wing}</p>
                  </div>
                )}
                {profile.holland && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Holland</p>
                    <p className="text-lg font-bold text-primary">{profile.holland.topCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
