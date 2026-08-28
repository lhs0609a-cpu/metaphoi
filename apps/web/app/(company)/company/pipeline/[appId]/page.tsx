'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Field, Select, Textarea } from '@/components/ui/field';
import { EmptyState, PageLoading } from '@/components/ui/states';
import { PageHeader } from '@/components/layouts/page-header';
import { FitScore } from '@/components/measure/fit-score';
import { useToast } from '@/components/ui/use-toast';
import { useCompanyAuthStore } from '@/lib/company-auth';
import { marketplaceApi } from '@/lib/marketplace-api';

const STAGES = [
  'applied', 'screening', 'interview_scheduled', 'interviewing',
  'evaluation', 'offer', 'hired', 'rejected',
];

const STAGE_LABELS: Record<string, string> = {
  applied: '지원', screening: '서류심사', interview_scheduled: '면접예정',
  interviewing: '면접진행', evaluation: '평가', offer: '오퍼',
  hired: '채용완료', rejected: '불합격',
};

const STAGE_TONE: Record<string, 'info' | 'signal' | 'warn' | 'ok' | 'neutral'> = {
  applied: 'info', screening: 'info', interview_scheduled: 'signal',
  interviewing: 'signal', evaluation: 'warn', offer: 'ok',
  hired: 'ok', rejected: 'neutral',
};

const INTERVIEW_TYPE: Record<string, string> = {
  phone: '전화', video: '화상', onsite: '대면', assignment: '과제',
};

interface Interview {
  id: string;
  round?: number;
  interview_type?: string;
  scheduled_at?: string;
  status?: string;
  evaluations?: unknown[];
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  company_members?: { name?: string };
}

interface Application {
  id: string;
  stage?: string;
  seeker_profiles?: { id?: string; display_name?: string };
  job_postings?: { title?: string; companies?: { name?: string } };
  matches?: { fit_score?: { total: number; ability?: number; culture?: number; condition?: number } };
}

/**
 * 지원자 상세 — 전형 진행의 실제 작업 화면.
 *
 * 되돌릴 수 없는 동작(오퍼 발송, 채용 확정)은 confirm() 대신 인라인 확인 단계를 둔다.
 * 브라우저 confirm은 실수로 눌러도 취소할 수 없고, 어떤 동작인지 다시 설명하지 못한다.
 */
export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.appId as string;
  const { token, isAuthenticated } = useCompanyAuthStore();
  const { toast } = useToast();

  const [app, setApp] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'offer' | 'hire' | null>(null);

  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    interview_type: 'video',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
  });

  const loadData = useCallback(async () => {
    if (!token) return;
    const [appRes, intRes, noteRes] = await Promise.all([
      marketplaceApi.applications.get(appId),
      marketplaceApi.applications.listInterviews(appId),
      marketplaceApi.applications.listNotes(appId, token),
    ]);
    setApp((appRes.data as Application) ?? null);
    setInterviews(Array.isArray(intRes.data) ? (intRes.data as Interview[]) : []);
    setNotes(Array.isArray(noteRes.data) ? (noteRes.data as Note[]) : []);
    setLoading(false);
  }, [appId, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/company/login');
      return;
    }
    loadData();
  }, [isAuthenticated, token, router, loadData]);

  const handleStageChange = async (stage: string) => {
    if (!token) return;
    setBusy('stage');
    const res = await marketplaceApi.applications.updateStage(appId, stage, token);
    setBusy(null);
    if (res.error) {
      toast({ title: '단계를 변경하지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: `‘${STAGE_LABELS[stage]}’(으)로 이동했습니다` });
    loadData();
  };

  const handleAddNote = async () => {
    if (!token || !newNote.trim()) return;
    setBusy('note');
    const res = await marketplaceApi.applications.createNote(appId, newNote.trim(), token);
    setBusy(null);
    if (res.error) {
      toast({ title: '메모를 저장하지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    setNewNote('');
    loadData();
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setBusy('interview');
    const res = await marketplaceApi.applications.createInterview(
      appId,
      { ...interviewForm, round: interviews.length + 1 },
      token,
    );
    setBusy(null);
    if (res.error) {
      toast({ title: '면접을 예약하지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    setShowInterviewForm(false);
    setInterviewForm({ interview_type: 'video', scheduled_at: '', duration_minutes: 60, location: '' });
    toast({ title: '면접을 예약했습니다' });
    loadData();
  };

  const handleOffer = async () => {
    if (!token) return;
    setBusy('offer');
    const res = await marketplaceApi.applications.sendOffer(appId, token);
    setBusy(null);
    setConfirming(null);
    if (res.error) {
      toast({ title: '오퍼를 보내지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: '오퍼를 보냈습니다', description: '후보자에게 알림이 전달됩니다.' });
    loadData();
  };

  const handleHire = async () => {
    if (!token) return;
    setBusy('hire');
    const res = await marketplaceApi.applications.confirmHire(appId, token);
    setBusy(null);
    setConfirming(null);
    if (res.error) {
      toast({ title: '채용을 확정하지 못했습니다', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: '채용을 확정했습니다' });
    loadData();
  };

  if (loading) return <PageLoading label="지원자 정보를 불러오는 중" />;
  if (!app) {
    return (
      <EmptyState
        title="지원 내역을 찾을 수 없습니다"
        description="삭제되었거나 접근 권한이 없습니다."
        action={{ label: '파이프라인으로', href: '/company/pipeline' }}
      />
    );
  }

  const stage = app.stage ?? 'applied';
  const currentIdx = STAGES.indexOf(stage);
  const fit = app.matches?.fit_score;
  const seekerId = app.seeker_profiles?.id;

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow={app.job_postings?.title}
        title={app.seeker_profiles?.display_name || '후보자'}
        description={app.job_postings?.companies?.name}
        badge={
          <Badge tone={STAGE_TONE[stage] ?? 'neutral'} size="md" dot>
            {STAGE_LABELS[stage] ?? stage}
          </Badge>
        }
        actions={
          seekerId ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/company/candidates/${seekerId}`}>프로필 보기</Link>
            </Button>
          ) : undefined
        }
      />

      {/* 전형 진행 바 */}
      <section className="rounded-card border border-border bg-card px-pad-i py-pad-b">
        <div className="scroll-x flex items-center gap-1 pb-1">
          {STAGES.slice(0, 7).map((s, i) => {
            const done = currentIdx >= 0 && i < currentIdx;
            const active = s === stage;
            return (
              <div key={s} className="flex flex-1 items-center gap-1">
                <span
                  className={
                    'whitespace-nowrap rounded-pill px-2.5 py-1 text-micro font-medium ' +
                    (active
                      ? 'bg-primary text-primary-foreground'
                      : done
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary text-muted-foreground')
                  }
                >
                  {STAGE_LABELS[s]}
                </span>
                {i < 6 ? (
                  <span
                    className={'h-px flex-1 ' + (done ? 'bg-primary/40' : 'bg-border')}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="단계 변경" htmlFor="stage-select" className="min-w-[12rem] flex-1">
            <Select
              id="stage-select"
              value=""
              disabled={busy === 'stage'}
              onChange={(e) => {
                if (e.target.value) handleStageChange(e.target.value);
              }}
            >
              <option value="">선택…</option>
              {STAGES.filter((s) => s !== stage).map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      {/* 적합도 */}
      {fit ? (
        <section className="mt-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <h2 className="mb-3 text-h4">적합도</h2>
          <FitScore fit={fit} />
        </section>
      ) : null}

      {/* 되돌릴 수 없는 동작 */}
      <section className="mt-4 flex flex-col gap-3 rounded-card border border-border bg-card px-pad-i py-pad-b">
        <h2 className="text-h4">전형 진행</h2>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInterviewForm((v) => !v)}
          >
            {showInterviewForm ? '면접 예약 닫기' : '면접 예약'}
          </Button>

          {confirming === 'offer' ? (
            <span className="flex items-center gap-2 rounded-control bg-warn-soft px-3 py-1.5">
              <span className="text-tiny text-warn">후보자에게 오퍼 알림이 갑니다</span>
              <Button size="sm" loading={busy === 'offer'} onClick={handleOffer}>
                보내기
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                취소
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setConfirming('offer')}>
              오퍼 보내기
            </Button>
          )}

          {confirming === 'hire' ? (
            <span className="flex items-center gap-2 rounded-control bg-ok-soft px-3 py-1.5">
              <span className="text-tiny text-ok">확정하면 되돌릴 수 없습니다</span>
              <Button size="sm" loading={busy === 'hire'} onClick={handleHire}>
                확정
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>
                취소
              </Button>
            </span>
          ) : (
            <Button size="sm" onClick={() => setConfirming('hire')}>
              채용 확정
            </Button>
          )}
        </div>

        {showInterviewForm ? (
          <form
            onSubmit={handleScheduleInterview}
            className="anim-rise flex flex-col gap-4 border-t border-border pt-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="면접 유형" htmlFor="interview_type">
                <Select
                  id="interview_type"
                  value={interviewForm.interview_type}
                  onChange={(e) =>
                    setInterviewForm((f) => ({ ...f, interview_type: e.target.value }))
                  }
                >
                  {Object.entries(INTERVIEW_TYPE).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </Field>

              <Field label="일시" htmlFor="scheduled_at" required>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={interviewForm.scheduled_at}
                  onChange={(e) =>
                    setInterviewForm((f) => ({ ...f, scheduled_at: e.target.value }))
                  }
                  required
                />
              </Field>
            </div>

            <Field label="장소 또는 링크" htmlFor="location">
              <Input
                id="location"
                value={interviewForm.location}
                onChange={(e) => setInterviewForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="회의실 3층 / https://meet…"
              />
            </Field>

            <Button type="submit" size="sm" loading={busy === 'interview'} className="self-start">
              {interviews.length + 1}차 면접 예약
            </Button>
          </form>
        ) : null}
      </section>

      {/* 면접 */}
      {interviews.length > 0 ? (
        <section className="mt-4 flex flex-col gap-2 rounded-card border border-border bg-card px-pad-i py-pad-b">
          <h2 className="mb-1 text-h4">면접 {interviews.length}건</h2>
          {interviews.map((iv) => (
            <div
              key={iv.id}
              className="flex items-center justify-between gap-3 rounded-control border border-border px-3.5 py-3"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-small font-medium">
                  {iv.round ?? '?'}차 · {INTERVIEW_TYPE[iv.interview_type ?? ''] ?? '유형 미정'}
                </p>
                {iv.scheduled_at ? (
                  <p className="text-tiny text-muted-foreground tnum">
                    {new Date(iv.scheduled_at).toLocaleString('ko-KR')}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {iv.evaluations && iv.evaluations.length > 0 ? (
                  <span className="text-micro text-muted-foreground">
                    평가 {iv.evaluations.length}건
                  </span>
                ) : null}
                <Badge
                  tone={
                    iv.status === 'completed' ? 'ok' : iv.status === 'cancelled' ? 'danger' : 'info'
                  }
                  size="sm"
                >
                  {iv.status === 'scheduled'
                    ? '예정'
                    : iv.status === 'completed'
                      ? '완료'
                      : iv.status === 'cancelled'
                        ? '취소'
                        : (iv.status ?? '—')}
                </Badge>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {/* 내부 메모 */}
      <section className="mt-4 flex flex-col gap-4 rounded-card border border-border bg-card px-pad-i py-pad-b">
        <div>
          <h2 className="text-h4">내부 메모</h2>
          <p className="mt-1 text-tiny text-muted-foreground">
            후보자에게는 보이지 않습니다. 평가 근거를 남겨두면 나중에 설명 요구에 대응할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Textarea
            rows={2}
            placeholder="예: 2차 면접에서 협업 사례를 구체적으로 설명함"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            aria-label="새 메모"
          />
          <Button
            size="sm"
            className="self-end"
            disabled={!newNote.trim()}
            loading={busy === 'note'}
            onClick={handleAddNote}
          >
            메모 추가
          </Button>
        </div>

        {notes.length === 0 ? (
          <p className="rounded-control bg-sunk px-3.5 py-3 text-tiny text-muted-foreground">
            아직 메모가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded-control bg-sunk px-3.5 py-3">
                <p className="whitespace-pre-wrap text-small">{note.content}</p>
                <p className="mt-1.5 text-micro text-muted-foreground">
                  {note.company_members?.name || '담당자'} ·{' '}
                  {new Date(note.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
