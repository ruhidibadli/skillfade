export interface User {
  id: string;
  email: string;
  is_admin?: boolean;
  settings: Record<string, any>;
  created_at: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  is_admin: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  skills_count: number;
  learning_events_count: number;
  practice_events_count: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  user_email: string | null;
  skills_count: number;
}

export interface AdminSkill {
  id: string;
  name: string;
  user_id: string;
  category_id: string | null;
  decay_rate: number;
  target_freshness: number | null;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
  user_email: string | null;
  category_name: string | null;
  learning_events_count: number;
  practice_events_count: number;
  freshness: number | null;
}

export interface AdminLearningEvent {
  id: string;
  skill_id: string;
  user_id: string;
  date: string;
  type: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  user_email: string | null;
  skill_name: string | null;
}

export interface AdminPracticeEvent {
  id: string;
  skill_id: string;
  user_id: string;
  date: string;
  type: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  user_email: string | null;
  skill_name: string | null;
}

export interface AdminEventTemplate {
  id: string;
  user_id: string;
  name: string;
  event_type: string;
  type: string;
  default_duration_minutes: number | null;
  default_notes: string | null;
  created_at: string;
  user_email: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminDashboardStats {
  total_users: number;
  total_skills: number;
  total_categories: number;
  total_learning_events: number;
  total_practice_events: number;
  total_templates: number;
  total_tickets: number;
  open_tickets: number;
  users_last_7_days: number;
  events_last_7_days: number;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  skill_count?: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
}

export interface SkillDependencyInfo {
  id: string;
  name: string;
  freshness: number | null;
  below_target: boolean | null;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category_id: string | null;
  category: CategoryInfo | null;
  decay_rate: number;
  target_freshness: number | null;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
  freshness?: number;
  days_since_practice?: number;
  practice_count?: number;
  learning_count?: number;
  below_target?: boolean;
  dependencies?: SkillDependencyInfo[];
  dependents?: SkillDependencyInfo[];
}

export type LearningEventType =
  | 'reading'
  | 'video'
  | 'course'
  | 'article'
  | 'documentation'
  | 'tutorial';

export type PracticeEventType =
  | 'exercise'
  | 'project'
  | 'work'
  | 'teaching'
  | 'writing'
  | 'building';

export interface LearningEvent {
  id: string;
  skill_id: string;
  user_id: string;
  date: string;
  type: LearningEventType;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface PracticeEvent {
  id: string;
  skill_id: string;
  user_id: string;
  date: string;
  type: PracticeEventType;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface Event {
  id: string;
  skill_id: string;
  user_id: string;
  date: string;
  type: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  event_type: 'learning' | 'practice';
}

export interface DashboardData {
  total_skills: number;
  learning_events_this_week: number;
  practice_events_this_week: number;
  weekly_balance_ratio: number;
  balance_interpretation: string;
}

export interface BalanceData {
  period: string;
  data: Array<{
    date: string;
    learning: number;
    practice: number;
  }>;
  total_learning: number;
  total_practice: number;
  balance_ratio: number;
  interpretation: string;
}

export interface FreshnessData {
  data: Array<{
    range: string;
    count: number;
  }>;
}

export interface CalendarEvent {
  id: string;
  skill_name: string;
  skill_id: string;
  type: string;
  event_type: 'learning' | 'practice';
  notes: string | null;
  duration_minutes: number | null;
}

export interface CalendarData {
  year: number;
  month: number;
  events_by_date: Record<string, CalendarEvent[]>;
}

export interface FreshnessHistoryPoint {
  date: string;
  freshness: number;
}

export interface FreshnessHistoryData {
  skill_id: string;
  skill_name: string;
  history: FreshnessHistoryPoint[];
  current_freshness: number;
}

export interface EventTemplate {
  id: string;
  user_id: string;
  name: string;
  event_type: 'learning' | 'practice';
  type: string;
  default_duration_minutes: number | null;
  default_notes: string | null;
  created_at: string;
}

export interface PeriodStats {
  learning: number;
  practice: number;
  total: number;
  ratio: number;
  interpretation: string;
}

export interface PeriodComparison {
  current_month: PeriodStats;
  last_month: PeriodStats;
  changes: {
    learning: number;
    practice: number;
    total: number;
    learning_percent: number;
    practice_percent: number;
  };
}

export interface CategoryStat {
  category: string;
  skill_count: number;
  average_freshness: number;
  total_learning: number;
  total_practice: number;
  total_events: number;
  skills: string[];
}

export interface CategoryStatsData {
  categories: CategoryStat[];
}

export interface PersonalRecords {
  skill_id: string;
  skill_name: string;
  longest_fresh_streak_days: number;
  longest_fresh_streak_start: string | null;
  longest_fresh_streak_end: string | null;
  peak_freshness: number;
  peak_freshness_date: string | null;
  most_active_week_start: string | null;
  most_active_week_events: number;
  longest_gap_recovered_days: number;
  total_learning_events: number;
  total_practice_events: number;
}

// Admin User Full Details
export interface AdminUserDetailSummary {
  total_skills: number;
  active_skills: number;
  archived_skills: number;
  total_categories: number;
  total_learning_events: number;
  total_practice_events: number;
  total_templates: number;
  total_learning_minutes: number;
  total_practice_minutes: number;
  average_freshness: number;
  recent_learning_events: number;
  recent_practice_events: number;
}

export interface AdminUserDetailCategory {
  id: string;
  name: string;
  created_at: string;
  skills_count: number;
}

export interface AdminUserDetailSkill {
  id: string;
  name: string;
  category_id: string | null;
  category_name: string | null;
  decay_rate: number;
  target_freshness: number | null;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
  learning_events_count: number;
  practice_events_count: number;
  freshness: number;
}

export interface AdminUserDetailEvent {
  id: string;
  skill_id: string;
  skill_name: string | null;
  date: string;
  type: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface AdminUserDetailTemplate {
  id: string;
  name: string;
  event_type: string;
  type: string;
  default_duration_minutes: number | null;
  default_notes: string | null;
  created_at: string;
}

export interface AdminUserFullDetails {
  user: {
    id: string;
    email: string;
    is_admin: boolean;
    settings: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  summary: AdminUserDetailSummary;
  categories: AdminUserDetailCategory[];
  skills: AdminUserDetailSkill[];
  learning_events: AdminUserDetailEvent[];
  practice_events: AdminUserDetailEvent[];
  templates: AdminUserDetailTemplate[];
}

// Ticket Types
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  replies: TicketReply[];
}

export interface TicketListItem {
  id: string;
  user_id: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  reply_count: number;
}

// Admin Ticket Types
export interface AdminTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  user_email: string | null;
  reply_count: number;
}

export interface AdminTicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  user_email: string | null;
}

export interface AdminTicketDetail extends AdminTicket {
  replies: AdminTicketReply[];
}
