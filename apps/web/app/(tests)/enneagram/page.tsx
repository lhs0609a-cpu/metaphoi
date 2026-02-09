import { TestContainer } from '@/components/tests/test-container';

export const metadata = {
  title: '에니어그램 성격 유형 검사 | Metaphoi',
  description: '9가지 성격 유형을 분석하는 에니어그램 검사',
};

export default function EnneagramTestPage() {
  return <TestContainer testCode="enneagram" testName="에니어그램 성격 유형 검사" />;
}
