import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CompanyMember {
  id: string;
  email: string;
  name: string;
  role: string;
  company_id: string;
  company_name: string;
}

interface CompanyAuthState {
  member: CompanyMember | null;
  token: string | null;
  isLoading: boolean;
  setMember: (member: CompanyMember | null) => void;
  setToken: (token: string | null) => void;
  register: (data: {
    company_name: string;
    email: string;
    password: string;
    member_name: string;
    industry?: string;
    size_range?: string;
    website?: string;
    location?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  fetchMember: () => Promise<void>;
}

export const useCompanyAuthStore = create<CompanyAuthState>()(
  persist(
    (set, get) => ({
      member: null,
      token: null,
      isLoading: false,

      setMember: (member) => set({ member }),
      setToken: (token) => set({ token }),

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/api/company/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || 'Registration failed' };
          }

          const result = await response.json();
          set({ token: result.access_token });
          await get().fetchMember();
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Network error' };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE_URL}/api/company/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || 'Login failed' };
          }

          const result = await response.json();
          set({ token: result.access_token });
          await get().fetchMember();
          return { success: true };
        } catch (error) {
          return { success: false, error: 'Network error' };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ member: null, token: null });
      },

      fetchMember: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE_URL}/api/company/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const member = await response.json();
            set({ member });
          } else {
            set({ member: null, token: null });
          }
        } catch {
          set({ member: null, token: null });
        }
      },
    }),
    {
      name: 'company-auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export function useCompanyAuth() {
  const store = useCompanyAuthStore();
  return {
    member: store.member,
    token: store.token,
    isLoading: store.isLoading,
    isAuthenticated: !!store.token && !!store.member,
    register: store.register,
    login: store.login,
    logout: store.logout,
    fetchMember: store.fetchMember,
  };
}
