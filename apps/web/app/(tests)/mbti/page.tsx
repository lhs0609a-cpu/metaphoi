import { TestContainer } from '@/components/tests/test-container';

export const metadata = {
  title: 'MBTI 성격 유형 검사 | Metaphoi',
  description: '16가지 성격 유형을 분석하는 MBTI 검사',
};

export default function MBTITestPage() {
  return <TestContainer testCode="mbti" testName="MBTI 성격 유형 검사" />;
}
