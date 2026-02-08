const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const api = {
  // Auth
  auth: {
    signup: (data: { email: string; password: string; name?: string }) =>
      request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
  },

  // Tests
  tests: {
    list: () => request('/api/tests'),
    get: (code: string) => request(`/api/tests/${code}`),
    start: (code: string) =>
      request(`/api/tests/${code}/start`, { method: 'POST' }),
    submit: (code: string, data: { sessionId: string; answers: unknown[] }) =>
      request(`/api/tests/${code}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    complete: (code: string, sessionId: string) =>
      request(`/api/tests/${code}/complete`, {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }),
  },

  // Results
  results: {
    list: () => request('/api/results'),
    get: (testCode: string) => request(`/api/results/${testCode}`),
  },

  // Abilities
  abilities: {
    get: () => request('/api/abilities'),
    radar: () => request('/api/abilities/radar'),
    calculate: () => request('/api/abilities/calculate', { method: 'POST' }),
  },

  // Reports
  reports: {
    preview: () => request('/api/reports/preview'),
    generate: (type: 'basic' | 'pro' | 'premium') =>
      request('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ type }),
      }),
    get: (id: string) => request(`/api/reports/${id}`),
  },

  // Payments
  payments: {
    prepare: (data: { reportType: string; amount: number }) =>
      request('/api/payments/prepare', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    confirm: (data: { paymentKey: string; orderId: string; amount: number }) =>
      request('/api/payments/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => request(`/api/payments/${id}`),
  },
};
