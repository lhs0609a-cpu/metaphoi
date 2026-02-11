const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
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

export const marketplaceApi = {
  // Seekers
  seekers: {
    createProfile: (data: any, token: string) =>
      request('/api/seekers/profile', { method: 'POST', body: JSON.stringify(data) }, token),
    getMyProfile: (token: string) =>
      request('/api/seekers/profile/me', {}, token),
    updateMyProfile: (data: any, token: string) =>
      request('/api/seekers/profile/me', { method: 'PUT', body: JSON.stringify(data) }, token),
    getProfile: (id: string) =>
      request(`/api/seekers/${id}`),
    search: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/api/seekers/${qs}`);
    },
  },

  // Companies
  companies: {
    get: (id: string) => request(`/api/companies/${id}`),
    update: (id: string, data: any, token: string) =>
      request(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/api/companies/${qs}`);
    },
    createTeam: (data: any, token: string) =>
      request('/api/companies/teams', { method: 'POST', body: JSON.stringify(data) }, token),
    listTeams: (token: string) =>
      request('/api/companies/teams/list', {}, token),
    updateTeam: (id: string, data: any, token: string) =>
      request(`/api/companies/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    deleteTeam: (id: string, token: string) =>
      request(`/api/companies/teams/${id}`, { method: 'DELETE' }, token),
  },

  // Jobs
  jobs: {
    create: (data: any, token: string) =>
      request('/api/jobs/', { method: 'POST', body: JSON.stringify(data) }, token),
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/api/jobs/${qs}`);
    },
    get: (id: string) => request(`/api/jobs/${id}`),
    update: (id: string, data: any, token: string) =>
      request(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    close: (id: string, token: string) =>
      request(`/api/jobs/${id}`, { method: 'DELETE' }, token),
    getCandidates: (id: string, token: string) =>
      request(`/api/jobs/${id}/candidates`, {}, token),
  },

  // Matching
  matching: {
    sendSeekerInterest: (data: any, token: string) =>
      request('/api/matching/interests/seeker', { method: 'POST', body: JSON.stringify(data) }, token),
    sendCompanyInterest: (data: any, token: string) =>
      request('/api/matching/interests/company', { method: 'POST', body: JSON.stringify(data) }, token),
    respondInterest: (id: string, data: any, token: string) =>
      request(`/api/matching/interests/${id}/respond`, { method: 'PUT', body: JSON.stringify(data) }, token),
    getSeekerSentInterests: (token: string) =>
      request('/api/matching/interests/sent/seeker', {}, token),
    getSeekerReceivedInterests: (token: string) =>
      request('/api/matching/interests/received/seeker', {}, token),
    getCompanySentInterests: (token: string) =>
      request('/api/matching/interests/sent/company', {}, token),
    getCompanyReceivedInterests: (token: string) =>
      request('/api/matching/interests/received/company', {}, token),
    getSeekerMatches: (token: string) =>
      request('/api/matching/matches/seeker', {}, token),
    getCompanyMatches: (token: string) =>
      request('/api/matching/matches/company', {}, token),
    getMatch: (id: string) =>
      request(`/api/matching/matches/${id}`),
    getMatchFit: (id: string) =>
      request(`/api/matching/matches/${id}/fit`),
  },

  // Applications
  applications: {
    create: (data: any, token: string) =>
      request('/api/applications/', { method: 'POST', body: JSON.stringify(data) }, token),
    listSeeker: (token: string) =>
      request('/api/applications/seeker', {}, token),
    listCompany: (token: string, params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/api/applications/company${qs}`, {}, token);
    },
    get: (id: string) => request(`/api/applications/${id}`),
    updateStage: (id: string, stage: string, token: string) =>
      request(`/api/applications/${id}/stage`, { method: 'PUT', body: JSON.stringify({ stage }) }, token),
    createInterview: (appId: string, data: any, token: string) =>
      request(`/api/applications/${appId}/interviews`, { method: 'POST', body: JSON.stringify(data) }, token),
    listInterviews: (appId: string) =>
      request(`/api/applications/${appId}/interviews`),
    updateInterview: (interviewId: string, data: any, token: string) =>
      request(`/api/applications/interviews/${interviewId}`, { method: 'PUT', body: JSON.stringify(data) }, token),
    createEvaluation: (interviewId: string, data: any, token: string) =>
      request(`/api/applications/interviews/${interviewId}/evaluations`, { method: 'POST', body: JSON.stringify(data) }, token),
    createNote: (appId: string, content: string, token: string) =>
      request(`/api/applications/${appId}/notes`, { method: 'POST', body: JSON.stringify({ content }) }, token),
    listNotes: (appId: string, token: string) =>
      request(`/api/applications/${appId}/notes`, {}, token),
    sendOffer: (appId: string, token: string) =>
      request(`/api/applications/${appId}/offer`, { method: 'PUT' }, token),
    confirmHire: (appId: string, token: string) =>
      request(`/api/applications/${appId}/hire`, { method: 'PUT' }, token),
  },

  // Messages
  messages: {
    getSeekerConversations: (token: string) =>
      request('/api/messages/conversations/seeker', {}, token),
    getSeekerMessages: (matchId: string, token: string) =>
      request(`/api/messages/conversations/seeker/${matchId}`, {}, token),
    sendSeekerMessage: (matchId: string, content: string, token: string) =>
      request(`/api/messages/conversations/seeker/${matchId}`, { method: 'POST', body: JSON.stringify({ content }) }, token),
    getCompanyConversations: (token: string) =>
      request('/api/messages/conversations/company', {}, token),
    getCompanyMessages: (matchId: string, token: string) =>
      request(`/api/messages/conversations/company/${matchId}`, {}, token),
    sendCompanyMessage: (matchId: string, content: string, token: string) =>
      request(`/api/messages/conversations/company/${matchId}`, { method: 'POST', body: JSON.stringify({ content }) }, token),
    markRead: (messageId: string) =>
      request(`/api/messages/${messageId}/read`, { method: 'PUT' }),
  },
};
