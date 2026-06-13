import type { TimeReport } from '../types';

/** Quote a CSV field if it contains a comma, quote, or newline (RFC 4180). */
function escapeField(value: string | number | null): string {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const HEADER = [
  'Skill', 'Category', 'Hours', 'Sessions',
  'Learning hours', 'Practice hours', 'Untimed sessions',
  'First activity', 'Last activity',
];

/**
 * Serialize a time report into a per-skill CSV with a trailing Total row.
 * Pure aggregation of the user's own logged data — no transformation of meaning.
 */
export function toActivityCsv(report: TimeReport): string {
  const rows: string[] = [HEADER.join(',')];

  for (const s of report.per_skill) {
    rows.push([
      s.skill_name, s.category, s.hours, s.sessions,
      s.learning_hours, s.practice_hours, s.untimed_sessions,
      s.first_activity, s.last_activity,
    ].map(escapeField).join(','));
  }

  const t = report.totals;
  rows.push([
    'Total', '', t.hours, t.sessions,
    t.learning_hours, t.practice_hours, t.untimed_sessions,
    t.first_activity, t.last_activity,
  ].map(escapeField).join(','));

  return rows.join('\n');
}
