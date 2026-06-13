import { describe, it, expect } from 'vitest';
import { toActivityCsv } from '../utils/csv';
import type { TimeReport } from '../types';

const report: TimeReport = {
  range: { start: '2026-01-01', end: '2026-02-28' },
  totals: {
    hours: 3, sessions: 4, timed_sessions: 3, untimed_sessions: 1,
    coverage_percent: 75, learning_hours: 1.5, practice_hours: 1.5,
    first_activity: '2026-01-10', last_activity: '2026-02-01',
  },
  per_skill: [
    {
      skill_id: '1', skill_name: 'Py,thon "3"', category: 'Back\nend',
      hours: 2.5, sessions: 3, learning_hours: 1, practice_hours: 1.5,
      first_activity: '2026-01-10', last_activity: '2026-02-01', untimed_sessions: 1,
    },
    {
      skill_id: '2', skill_name: 'SQL', category: 'Uncategorized',
      hours: 0.5, sessions: 1, learning_hours: 0.5, practice_hours: 0,
      first_activity: '2026-01-20', last_activity: '2026-01-20', untimed_sessions: 0,
    },
  ],
  per_category: [],
  by_month: [],
  hours_vs_freshness: [],
};

describe('toActivityCsv', () => {
  it('starts with a header row', () => {
    const firstLine = toActivityCsv(report).split('\n')[0];
    expect(firstLine).toBe(
      'Skill,Category,Hours,Sessions,Learning hours,Practice hours,Untimed sessions,First activity,Last activity',
    );
  });

  it('escapes commas and quotes per RFC 4180', () => {
    expect(toActivityCsv(report)).toContain('"Py,thon ""3"""');
  });

  it('quotes fields containing newlines', () => {
    expect(toActivityCsv(report)).toContain('"Back\nend"');
  });

  it('emits a plain (unquoted) row for simple values', () => {
    expect(toActivityCsv(report)).toContain('SQL,Uncategorized,0.5,1,0.5,0,0,2026-01-20,2026-01-20');
  });

  it('appends a Total row from report.totals', () => {
    expect(toActivityCsv(report)).toContain('Total,,3,4,1.5,1.5,1,2026-01-10,2026-02-01');
  });

  it('renders null activity dates as empty cells', () => {
    const empty: TimeReport = {
      ...report,
      totals: { ...report.totals, first_activity: null, last_activity: null },
      per_skill: [],
    };
    expect(toActivityCsv(empty)).toContain('Total,,3,4,1.5,1.5,1,,');
  });
});
