export interface User {
  id: string;
  email: string;
  settings: Record<string, any>;
  created_at: string;
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
  category: string | null;
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
