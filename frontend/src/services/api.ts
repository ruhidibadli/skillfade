import axios from 'axios';
import type {
  User,
  Skill,
  LearningEvent,
  PracticeEvent,
  Event,
  DashboardData,
  BalanceData,
  FreshnessData,
  CalendarData,
  FreshnessHistoryData,
  EventTemplate,
  PeriodComparison,
  CategoryStatsData,
  PersonalRecords
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  register: (email: string, password: string) =>
    api.post<User>('/auth/register', { email, password }),

  login: async (email: string, password: string) => {
    const response = await api.post<{ access_token: string; token_type: string }>(
      '/auth/login',
      { email, password }
    );
    localStorage.setItem('token', response.data.access_token);
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    return api.post('/auth/logout');
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
};

// Skills
export const skills = {
  list: (includeArchived = false) =>
    api.get<Skill[]>('/skills', { params: { include_archived: includeArchived } }),

  create: (data: { name: string; category?: string; decay_rate?: number; target_freshness?: number; notes?: string }) =>
    api.post<Skill>('/skills', data),

  get: (id: string) =>
    api.get<Skill>(`/skills/${id}`),

  update: (id: string, data: { name?: string; category?: string; decay_rate?: number; target_freshness?: number; notes?: string }) =>
    api.patch<Skill>(`/skills/${id}`, data),

  archive: (id: string) =>
    api.delete(`/skills/${id}`),

  updateDependencies: (id: string, dependencyIds: string[]) =>
    api.put<Skill>(`/skills/${id}/dependencies`, { dependency_ids: dependencyIds }),
};

// Events
export const events = {
  list: (skillId: string) =>
    api.get<{ events: Event[] }>(`/skills/${skillId}/events`),

  createLearning: (skillId: string, data: Partial<LearningEvent>) =>
    api.post<LearningEvent>(`/skills/${skillId}/learning-events`, data),

  createPractice: (skillId: string, data: Partial<PracticeEvent>) =>
    api.post<PracticeEvent>(`/skills/${skillId}/practice-events`, data),

  updateLearning: (eventId: string, data: Partial<LearningEvent>) =>
    api.patch<LearningEvent>(`/learning-events/${eventId}`, data),

  updatePractice: (eventId: string, data: Partial<PracticeEvent>) =>
    api.patch<PracticeEvent>(`/practice-events/${eventId}`, data),

  deleteLearning: (eventId: string) =>
    api.delete(`/learning-events/${eventId}`),

  deletePractice: (eventId: string) =>
    api.delete(`/practice-events/${eventId}`),
};

// Analytics
export const analytics = {
  dashboard: () =>
    api.get<DashboardData>('/analytics/dashboard'),

  balance: (period: 'week' | 'month' | 'quarter' = 'month') =>
    api.get<BalanceData>('/analytics/balance', { params: { period } }),

  skillsByFreshness: () =>
    api.get<FreshnessData>('/analytics/skills-by-freshness'),

  calendar: (month?: number, year?: number) =>
    api.get<CalendarData>('/analytics/calendar', { params: { month, year } }),

  freshnessHistory: (skillId: string, days: number = 90) =>
    api.get<FreshnessHistoryData>(`/analytics/skills/${skillId}/freshness-history`, { params: { days } }),

  periodComparison: () =>
    api.get<PeriodComparison>('/analytics/period-comparison'),

  categoryStats: () =>
    api.get<CategoryStatsData>('/analytics/category-stats'),

  personalRecords: (skillId: string) =>
    api.get<PersonalRecords>(`/analytics/skills/${skillId}/personal-records`),
};

// Settings
export const settings = {
  get: () =>
    api.get<{ settings: Record<string, any> }>('/settings'),

  update: (data: Record<string, any>) =>
    api.patch('/settings', { settings: data }),

  export: () =>
    api.get('/settings/export'),

  deleteAccount: () =>
    api.delete('/settings/account'),
};

// Event Templates
export const templates = {
  list: () =>
    api.get<EventTemplate[]>('/templates'),

  create: (data: {
    name: string;
    event_type: 'learning' | 'practice';
    type: string;
    default_duration_minutes?: number;
    default_notes?: string;
  }) =>
    api.post<EventTemplate>('/templates', data),

  get: (id: string) =>
    api.get<EventTemplate>(`/templates/${id}`),

  update: (id: string, data: Partial<{
    name: string;
    event_type: 'learning' | 'practice';
    type: string;
    default_duration_minutes: number;
    default_notes: string;
  }>) =>
    api.patch<EventTemplate>(`/templates/${id}`, data),

  delete: (id: string) =>
    api.delete(`/templates/${id}`),
};

export default api;
