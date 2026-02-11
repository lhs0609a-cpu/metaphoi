'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

export default function CompanyTeamPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useCompanyAuthStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ team_name: '', team_size: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }
    loadTeams();
  }, [isAuthenticated, token, router]);

  const loadTeams = async () => {
    if (!token) return;
    const res = await marketplaceApi.companies.listTeams(token);
    setTeams(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const data = {
      team_name: form.team_name,
      team_size: form.team_size ? parseInt(form.team_size) : null,
      description: form.description || null,
    };

    await marketplaceApi.companies.createTeam(data, token);
    setForm({ team_name: '', team_size: '', description: '' });
    setShowForm(false);
    loadTeams();
  };

  const handleDelete = async (teamId: string) => {
    if (!token || !confirm('이 팀을 삭제하시겠습니까?')) return;
    await marketplaceApi.companies.deleteTeam(teamId, token);
    loadTeams();
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : '팀 추가'}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">팀 프로필 관리</h1>

        {showForm && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="팀 이름"
                  value={form.team_name}
                  onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))}
                  required
                />
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="팀 인원"
                  value={form.team_size}
                  onChange={(e) => setForm((f) => ({ ...f, team_size: e.target.value }))}
                />
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="팀 설명"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
                <Button type="submit" size="sm">팀 생성</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : teams.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              등록된 팀이 없습니다. 팀을 추가하여 채용 공고에 연결하세요.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{team.team_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.team_size ? `${team.team_size}명` : ''} {team.description || ''}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(team.id)}>
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
