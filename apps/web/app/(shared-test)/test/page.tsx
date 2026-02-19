import { ComprehensiveTestContainer } from '@/components/tests/comprehensive-test-container';

export const metadata = {
  title: 'Metaphoi 종합 심리검사',
  description: '7가지 검사를 한 번에 - MBTI, DISC, 에니어그램, Holland, 사상체질, 사주, 혈액형 종합 분석',
};

export default function TestPage() {
  return <ComprehensiveTestContainer />;
}
