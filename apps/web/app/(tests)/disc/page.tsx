import { TestContainer } from '@/components/tests/test-container';

export const metadata = {
  title: 'DISC 행동 유형 검사 | Metaphoi',
  description: '4가지 행동 유형을 분석하는 DISC 검사',
};

export default function DISCTestPage() {
  return <TestContainer testCode="disc" testName="DISC 행동 유형 검사" />;
}
