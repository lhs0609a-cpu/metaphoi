import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          birth_date: string | null;
          birth_time: string | null;
          gender: string | null;
          blood_type: string | null;
          profile_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          gender?: string | null;
          blood_type?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          gender?: string | null;
          blood_type?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tests: {
        Row: {
          id: number;
          code: string;
          name: string;
          description: string | null;
          question_count: number | null;
          estimated_minutes: number | null;
          category: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: number;
          code: string;
          name: string;
          description?: string | null;
          question_count?: number | null;
          estimated_minutes?: number | null;
          category?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
          description?: string | null;
          question_count?: number | null;
          estimated_minutes?: number | null;
          category?: string | null;
          is_active?: boolean;
        };
      };
      test_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          test_id: number | null;
          status: string;
          started_at: string;
          completed_at: string | null;
          time_spent_seconds: number | null;
          fraud_score: number;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          test_id?: number | null;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          time_spent_seconds?: number | null;
          fraud_score?: number;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          test_id?: number | null;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          time_spent_seconds?: number | null;
          fraud_score?: number;
        };
      };
      test_results: {
        Row: {
          id: string;
          session_id: string | null;
          user_id: string | null;
          test_id: number | null;
          raw_scores: Record<string, unknown> | null;
          processed_result: Record<string, unknown> | null;
          result_type: string | null;
          reliability_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
          test_id?: number | null;
          raw_scores?: Record<string, unknown> | null;
          processed_result?: Record<string, unknown> | null;
          result_type?: string | null;
          reliability_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          user_id?: string | null;
          test_id?: number | null;
          raw_scores?: Record<string, unknown> | null;
          processed_result?: Record<string, unknown> | null;
          result_type?: string | null;
          reliability_score?: number | null;
          created_at?: string;
        };
      };
      user_abilities: {
        Row: {
          id: number;
          user_id: string | null;
          ability_id: number | null;
          score: number | null;
          confidence: number | null;
          source_tests: Record<string, unknown> | null;
          calculated_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          ability_id?: number | null;
          score?: number | null;
          confidence?: number | null;
          source_tests?: Record<string, unknown> | null;
          calculated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          ability_id?: number | null;
          score?: number | null;
          confidence?: number | null;
          source_tests?: Record<string, unknown> | null;
          calculated_at?: string;
        };
      };
    };
  };
};
