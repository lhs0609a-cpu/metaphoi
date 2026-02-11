'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function SeekerProfilePage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    marketplaceApi.seekers.getMyProfile(token).then((res) => {
      if (res.error) {
        router.push('/seeker/register');
      } else {
        setProfile(res.data);
      }
      setLoading(false);
    });
  }, [isAuthenticated, token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const abilities = profile.abilities_snapshot || [];
  const topAbilities = [...abilities].sort((a: any, b: any) => b.score - a.score).slice(0, 5);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Metaphoi</Link>
          <div className="flex gap-3">
            <Link href="/seeker/companies">
              <Button variant="outline" size="sm">기업 탐색</Button>
            </Link>
            <Link href="/seeker/matches">
              <Button variant="outline" size="sm">매칭</Button>
            </Link>
            <Link href="/seeker/messages">
              <Button variant="outline" size="sm">메시지</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">내 구직자 프로필</h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-xs rounded-full ${
              profile.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {profile.is_active ? '구직 중' : '비활성'}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              {profile.visibility === 'public' ? '전체 공개' : profile.visibility === 'matched_only' ? '매칭 기업만' : '비공개'}
            </span>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-1">{profile.display_name || '이름 미설정'}</h2>
            <p className="text-muted-foreground mb-4">{profile.headline || '자기소개를 작성해주세요'}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">희망 직무</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(profile.desired_roles || []).map((r: string) => (
                    <span key={r} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">관심 산업</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(profile.desired_industries || []).map((i: string) => (
                    <span key={i} className="px-2 py-0.5 bg-muted text-xs rounded-full">{i}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">경력</span>
                <p className="font-medium">{profile.experience_years != null ? `${profile.experience_years}년` : '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">학력</span>
                <p className="font-medium">{profile.education || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">희망 연봉</span>
                <p className="font-medium">{profile.salary_range || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">근무 형태</span>
                <p className="font-medium">
                  {profile.remote_pref === 'remote' ? '재택' : profile.remote_pref === 'hybrid' ? '하이브리드' : profile.remote_pref === 'onsite' ? '출근' : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {topAbilities.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">TOP 5 능력치</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topAbilities.map((a: any, i: number) => (
                <div key={a.key} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary w-5">{i + 1}</span>
                  <span className="text-sm font-medium w-24 shrink-0">{a.name}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${a.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{a.score}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {profile.comprehensive_profile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">유형 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.comprehensive_profile.mbti && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">MBTI</p>
                    <p className="text-lg font-bold text-primary">{profile.comprehensive_profile.mbti.type}</p>
                  </div>
                )}
                {profile.comprehensive_profile.disc && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">DISC</p>
                    <p className="text-lg font-bold text-primary">{profile.comprehensive_profile.disc.type}</p>
                  </div>
                )}
                {profile.comprehensive_profile.enneagram && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">에니어그램</p>
                    <p className="text-lg font-bold text-primary">{profile.comprehensive_profile.enneagram.wing}</p>
                  </div>
                )}
                {profile.comprehensive_profile.holland && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Holland</p>
                    <p className="text-lg font-bold text-primary">{profile.comprehensive_profile.holland.topCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Link href="/seeker/companies" className="flex-1">
            <Button className="w-full">기업 탐색하기</Button>
          </Link>
          <Link href="/seeker/matches" className="flex-1">
            <Button variant="outline" className="w-full">매칭 확인</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
