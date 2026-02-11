'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

const STAGES = ['applied', 'screening', 'interview_scheduled', 'interviewing', 'evaluation', 'offer', 'hired', 'rejected'];
const STAGE_LABELS: Record<string, string> = {
  applied: '지원', screening: '서류심사', interview_scheduled: '면접예정',
  interviewing: '면접진행', evaluation: '평가', offer: '오퍼',
  hired: '채용완료', rejected: '불합격',
};

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.appId as string;
  const { token, isAuthenticated } = useCompanyAuthStore();

  const [app, setApp] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  // 면접 스케줄링 폼
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interview_type: 'video',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }

    loadData();
  }, [appId, isAuthenticated, token, router]);

  const loadData = async () => {
    if (!token) return;
    const [appRes, intRes, noteRes] = await Promise.all([
      marketplaceApi.applications.get(appId),
      marketplaceApi.applications.listInterviews(appId),
      marketplaceApi.applications.listNotes(appId, token),
    ]);
    setApp(appRes.data);
    setInterviews(Array.isArray(intRes.data) ? intRes.data : []);
    setNotes(Array.isArray(noteRes.data) ? noteRes.data : []);
    setLoading(false);
  };

  const handleStageChange = async (stage: string) => {
    if (!token) return;
    await marketplaceApi.applications.updateStage(appId, stage, token);
    loadData();
  };

  const handleAddNote = async () => {
    if (!token || !newNote.trim()) return;
    await marketplaceApi.applications.createNote(appId, newNote, token);
    setNewNote('');
    loadData();
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    await marketplaceApi.applications.createInterview(appId, {
      ...interviewForm,
      round: interviews.length + 1,
    }, token);

    setShowInterviewForm(false);
    setInterviewForm({ interview_type: 'video', scheduled_at: '', duration_minutes: 60, location: '' });
    loadData();
  };

  const handleOffer = async () => {
    if (!token || !confirm('오퍼를 보내시겠습니까?')) return;
    await marketplaceApi.applications.sendOffer(appId, token);
    loadData();
  };

  const handleHire = async () => {
    if (!token || !confirm('채용을 확정하시겠습니까?')) return;
    await marketplaceApi.applications.confirmHire(appId, token);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!app) return null;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/company/dashboard" className="text-xl font-bold text-primary">Metaphoi</Link>
          <Link href="/company/pipeline">
            <Button variant="outline" size="sm">파이프라인</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* 지원자 정보 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold">
                  {app.seeker_profiles?.display_name || '후보자'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {app.job_postings?.title || ''} · {app.job_postings?.companies?.name || ''}
                </p>
                {app.matches?.fit_score && (
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="text-primary font-bold">핏 {app.matches.fit_score.total}%</span>
                    <span className="text-muted-foreground">능력 {app.matches.fit_score.ability}%</span>
                    <span className="text-muted-foreground">문화 {app.matches.fit_score.culture}%</span>
                    <span className="text-muted-foreground">조건 {app.matches.fit_score.condition}%</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary text-center">
                  {STAGE_LABELS[app.stage] || app.stage}
                </span>
                <select
                  className="text-xs border rounded px-2 py-1"
                  value=""
                  onChange={(e) => { if (e.target.value) handleStageChange(e.target.value); }}
                >
                  <option value="">단계 변경...</option>
                  {STAGES.filter((s) => s !== app.stage).map((s) => (
                    <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setShowInterviewForm(!showInterviewForm)}>
                면접 스케줄링
              </Button>
              <Button size="sm" variant="outline" onClick={handleOffer}>오퍼 보내기</Button>
              <Button size="sm" onClick={handleHire}>채용 확정</Button>
            </div>
          </CardContent>
        </Card>

        {/* 면접 스케줄링 */}
        {showInterviewForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">면접 스케줄링</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleInterview} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">면접 유형</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={interviewForm.interview_type}
                      onChange={(e) => setInterviewForm((f) => ({ ...f, interview_type: e.target.value }))}
                    >
                      <option value="phone">전화</option>
                      <option value="video">화상</option>
                      <option value="onsite">대면</option>
                      <option value="assignment">과제</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">일시</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={interviewForm.scheduled_at}
                      onChange={(e) => setInterviewForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">장소/링크</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <Button type="submit" size="sm">면접 예약</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 면접 목록 */}
        {interviews.length > 0 && (
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">면접 ({interviews.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {interviews.map((interview) => (
                <div key={interview.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {interview.round}차 면접 ({interview.interview_type || '미정'})
                      </p>
                      {interview.scheduled_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(interview.scheduled_at).toLocaleString('ko-KR')}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                      interview.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {interview.status === 'scheduled' ? '예정' : interview.status === 'completed' ? '완료' : interview.status}
                    </span>
                  </div>
                  {interview.evaluations && interview.evaluations.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      평가 {interview.evaluations.length}건
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 내부 메모 */}
        <Card>
          <CardHeader><CardTitle className="text-lg">내부 메모</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 border rounded-md px-3 py-2 text-sm"
                placeholder="메모를 입력하세요..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
              />
              <Button size="sm" onClick={handleAddNote}>추가</Button>
            </div>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.company_members?.name || '담당자'} · {new Date(note.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
