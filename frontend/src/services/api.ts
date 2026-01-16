import axios from 'axios';
import type {
  User,
  Skill,
  Category,
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
  PersonalRecords,
  AdminUser,
  AdminSkill,
  AdminCategory,
  AdminLearningEvent,
  AdminPracticeEvent,
  AdminEventTemplate,
  AdminDashboardStats,
  PaginatedResponse,
  AdminUserFullDetails,
  Ticket,
  TicketListItem,
  TicketReply,
  TicketStatus,
  AdminTicket,
  AdminTicketDetail,
  AdminTicketReply
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
      // Don't redirect if the error is from login/register endpoints
      // These endpoints return 401 for invalid credentials, not expired tokens
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
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

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, new_password: newPassword }),
};

// Skills
export const skills = {
  list: (includeArchived = false) =>
    api.get<Skill[]>('/skills', { params: { include_archived: includeArchived } }),

  create: (data: { name: string; category_id?: string; category_name?: string; decay_rate?: number; target_freshness?: number; notes?: string }) =>
    api.post<Skill>('/skills', data),

  get: (id: string) =>
    api.get<Skill>(`/skills/${id}`),

  update: (id: string, data: { name?: string; category_id?: string; category_name?: string; decay_rate?: number; target_freshness?: number; notes?: string }) =>
    api.patch<Skill>(`/skills/${id}`, data),

  archive: (id: string) =>
    api.delete(`/skills/${id}`),

  updateDependencies: (id: string, dependencyIds: string[]) =>
    api.put<Skill>(`/skills/${id}/dependencies`, { dependency_ids: dependencyIds }),
};

// Categories
export const categories = {
  list: () =>
    api.get<Category[]>('/categories'),

  create: (data: { name: string }) =>
    api.post<Category>('/categories', data),

  get: (id: string) =>
    api.get<Category>(`/categories/${id}`),

  update: (id: string, data: { name?: string }) =>
    api.patch<Category>(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),
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

// Admin API
export const admin = {
  // Stats
  getStats: () =>
    api.get<AdminDashboardStats>('/admin/stats'),

  // Users
  listUsers: (params?: { page?: number; page_size?: number; search?: string; is_admin?: boolean }) =>
    api.get<PaginatedResponse<AdminUser>>('/admin/users', { params }),

  getUser: (id: string) =>
    api.get<AdminUser>(`/admin/users/${id}`),

  getUserFullDetails: (id: string) =>
    api.get<AdminUserFullDetails>(`/admin/users/${id}/details`),

  createUser: (data: { email: string; password: string; is_admin?: boolean }) =>
    api.post<AdminUser>('/admin/users', data),

  updateUser: (id: string, data: { email?: string; password?: string; is_admin?: boolean; settings?: Record<string, any> }) =>
    api.patch<AdminUser>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),

  // Categories
  listCategories: (params?: { page?: number; page_size?: number; search?: string; user_id?: string }) =>
    api.get<PaginatedResponse<AdminCategory>>('/admin/categories', { params }),

  getCategory: (id: string) =>
    api.get<AdminCategory>(`/admin/categories/${id}`),

  createCategory: (data: { name: string; user_id: string }) =>
    api.post<AdminCategory>('/admin/categories', data),

  updateCategory: (id: string, data: { name?: string; user_id?: string }) =>
    api.patch<AdminCategory>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/admin/categories/${id}`),

  // Skills
  listSkills: (params?: { page?: number; page_size?: number; search?: string; user_id?: string; category_id?: string; include_archived?: boolean }) =>
    api.get<PaginatedResponse<AdminSkill>>('/admin/skills', { params }),

  getSkill: (id: string) =>
    api.get<AdminSkill>(`/admin/skills/${id}`),

  createSkill: (data: { name: string; user_id: string; category_id?: string; decay_rate?: number; target_freshness?: number; notes?: string }) =>
    api.post<AdminSkill>('/admin/skills', data),

  updateSkill: (id: string, data: { name?: string; user_id?: string; category_id?: string; decay_rate?: number; target_freshness?: number; notes?: string; archived_at?: string }) =>
    api.patch<AdminSkill>(`/admin/skills/${id}`, data),

  deleteSkill: (id: string) =>
    api.delete(`/admin/skills/${id}`),

  // Learning Events
  listLearningEvents: (params?: { page?: number; page_size?: number; search?: string; user_id?: string; skill_id?: string; event_type?: string }) =>
    api.get<PaginatedResponse<AdminLearningEvent>>('/admin/learning-events', { params }),

  getLearningEvent: (id: string) =>
    api.get<AdminLearningEvent>(`/admin/learning-events/${id}`),

  createLearningEvent: (data: { skill_id: string; user_id: string; date: string; type: string; notes?: string; duration_minutes?: number }) =>
    api.post<AdminLearningEvent>('/admin/learning-events', data),

  updateLearningEvent: (id: string, data: { skill_id?: string; user_id?: string; date?: string; type?: string; notes?: string; duration_minutes?: number }) =>
    api.patch<AdminLearningEvent>(`/admin/learning-events/${id}`, data),

  deleteLearningEvent: (id: string) =>
    api.delete(`/admin/learning-events/${id}`),

  // Practice Events
  listPracticeEvents: (params?: { page?: number; page_size?: number; search?: string; user_id?: string; skill_id?: string; event_type?: string }) =>
    api.get<PaginatedResponse<AdminPracticeEvent>>('/admin/practice-events', { params }),

  getPracticeEvent: (id: string) =>
    api.get<AdminPracticeEvent>(`/admin/practice-events/${id}`),

  createPracticeEvent: (data: { skill_id: string; user_id: string; date: string; type: string; notes?: string; duration_minutes?: number }) =>
    api.post<AdminPracticeEvent>('/admin/practice-events', data),

  updatePracticeEvent: (id: string, data: { skill_id?: string; user_id?: string; date?: string; type?: string; notes?: string; duration_minutes?: number }) =>
    api.patch<AdminPracticeEvent>(`/admin/practice-events/${id}`, data),

  deletePracticeEvent: (id: string) =>
    api.delete(`/admin/practice-events/${id}`),

  // Templates
  listTemplates: (params?: { page?: number; page_size?: number; search?: string; user_id?: string; event_type?: string }) =>
    api.get<PaginatedResponse<AdminEventTemplate>>('/admin/templates', { params }),

  getTemplate: (id: string) =>
    api.get<AdminEventTemplate>(`/admin/templates/${id}`),

  createTemplate: (data: { user_id: string; name: string; event_type: string; type: string; default_duration_minutes?: number; default_notes?: string }) =>
    api.post<AdminEventTemplate>('/admin/templates', data),

  updateTemplate: (id: string, data: { user_id?: string; name?: string; event_type?: string; type?: string; default_duration_minutes?: number; default_notes?: string }) =>
    api.patch<AdminEventTemplate>(`/admin/templates/${id}`, data),

  deleteTemplate: (id: string) =>
    api.delete(`/admin/templates/${id}`),

  // Tickets
  listTickets: (params?: { page?: number; page_size?: number; search?: string; user_id?: string; status?: TicketStatus }) =>
    api.get<PaginatedResponse<AdminTicket>>('/admin/tickets', { params }),

  getTicket: (id: string) =>
    api.get<AdminTicketDetail>(`/admin/tickets/${id}`),

  updateTicket: (id: string, data: { status?: TicketStatus }) =>
    api.patch<AdminTicket>(`/admin/tickets/${id}`, data),

  addTicketReply: (id: string, data: { message: string }) =>
    api.post<AdminTicketReply>(`/admin/tickets/${id}/replies`, data),

  deleteTicket: (id: string) =>
    api.delete(`/admin/tickets/${id}`),
};

// Tickets (User)
export const tickets = {
  list: () =>
    api.get<TicketListItem[]>('/tickets'),

  create: (data: { subject: string; message: string }) =>
    api.post<Ticket>('/tickets', data),

  get: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`),

  addReply: (id: string, data: { message: string }) =>
    api.post<TicketReply>(`/tickets/${id}/replies`, data),
};

export default api;
