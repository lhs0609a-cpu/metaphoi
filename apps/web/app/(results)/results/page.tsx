'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestResultCard } from '@/components/results/test-result-card';
import { useAuth } from '@/lib/auth';

interface TestResult {
  id: string;
  test_code: string;
  test_name: string;
  result_type: string;
  processed_result: Record<string, any>;
  created_at: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_URL}/api/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token, isAuthenticated, router, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Metaphoi
          </Link>
          <div className="flex gap-2">
            <Link href="/abilities">
              <Button variant="outline" size="sm">
                능력치
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                대시보드
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">검사 결과</h1>
            <p className="text-muted-foreground mt-1">
              완료한 검사의 상세 결과를 확인하세요
            </p>
          </div>
          <Link href="/reports">
            <Button>종합 리포트 보기</Button>
          </Link>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <TestResultCard
                key={result.id}
                testCode={result.test_code}
                testName={result.test_name}
                resultType={result.result_type}
                completedAt={result.created_at}
                processedResult={result.processed_result}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                아직 완료한 검사가 없습니다.
              </p>
              <Link href="/dashboard">
                <Button>검사하러 가기</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && results.length < 5 && (
          <Card className="mt-8 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">더 많은 검사를 완료하세요</CardTitle>
              <CardDescription>
                종합 리포트를 받으려면 최소 5개의 검사를 완료해야 합니다.
                현재 {results.length}개 완료
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="outline">검사하러 가기</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
