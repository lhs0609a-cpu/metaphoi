// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  birth_date?: string;
  birth_time?: string;
  gender?: string;
  blood_type?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

// Test types
export type TestCategory = 'personality' | 'aptitude' | 'traditional';
export type QuestionType = 'likert' | 'choice' | 'drawing' | 'input' | 'image_select';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Test {
  id: number;
  code: string;
  name: string;
  description?: string;
  question_count?: number;
  estimated_minutes?: number;
  category?: TestCategory;
  is_active: boolean;
}

export interface Question {
  id: number;
  test_id: number;
  question_number: number;
  question_type: QuestionType;
  question_text: string;
  options?: Record<string, unknown>;
  scoring_weights?: Record<string, unknown>;
}

export interface TestSession {
  id: string;
  user_id?: string;
  test_id: number;
  status: SessionStatus;
  started_at: string;
  completed_at?: string;
  time_spent_seconds?: number;
  fraud_score: number;
}

export interface Response {
  question_id: number;
  answer: unknown;
  response_time_ms?: number;
  typing_pattern?: Record<string, unknown>;
}

export interface TestResult {
  id: string;
  session_id: string;
  user_id: string;
  test_id: number;
  raw_scores?: Record<string, unknown>;
  processed_result?: Record<string, unknown>;
  result_type?: string;
  reliability_score?: number;
  created_at: string;
}

// Ability types
export type AbilityCategory = 'mental' | 'social' | 'work' | 'physical' | 'potential';

export interface Ability {
  id: number;
  code: string;
  name: string;
  category: AbilityCategory;
  description?: string;
  max_score: number;
}

export interface UserAbility {
  id: number;
  user_id: string;
  ability_id: number;
  score?: number;
  confidence?: number;
  source_tests?: string[];
  calculated_at: string;
}

export interface AbilityScore {
  code: string;
  name: string;
  category: AbilityCategory;
  score: number;
  max_score: number;
  confidence: number;
  source_tests: string[];
}

export interface AbilityRadarData {
  category: string;
  abilities: AbilityScore[];
}

export interface AllAbilitiesResponse {
  total_score: number;
  max_total_score: number;
  reliability: number;
  categories: AbilityRadarData[];
  completed_tests: string[];
  pending_tests: string[];
}

// Report types
export type ReportType = 'basic' | 'pro' | 'premium';

export interface Report {
  id: string;
  user_id: string;
  report_type: ReportType;
  report_data?: Record<string, unknown>;
  generated_at: string;
  expires_at?: string;
}

// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Payment {
  id: string;
  user_id: string;
  report_id?: string;
  amount: number;
  currency: string;
  payment_key?: string;
  order_id?: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
