import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analytics } from '../services/api';
import { usePlan } from '../context/PlanContext';
import { toActivityCsv } from '../utils/csv';
import type { TimeReport } from '../types';
import { ArrowLeft, Printer, Download, Lock, Loader2, Clock } from 'lucide-react';

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

type PresetKey = 'last12' | 'thisYear' | 'thisQuarter' | 'custom';

function presetRange(key: PresetKey, today = new Date()): { start: string; end: string } {
  const end = isoLocal(today);
  if (key === 'thisYear') return { start: `${today.getFullYear()}-01-01`, end };
  if (key === 'thisQuarter') {
    const q = Math.floor(today.getMonth() / 3);
    return { start: isoLocal(new Date(today.getFullYear(), q * 3, 1)), end };
  }
  // last12 (default)
  return { start: isoLocal(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())), end };
}

const fmtDate = (s: string | null) =>
  s ? new Date(s + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'last12', label: 'Last 12 months' },
  { key: 'thisYear', label: 'This year' },
  { key: 'thisQuarter', label: 'This quarter' },
  { key: 'custom', label: 'Custom' },
];

const ActivityReport: React.FC = () => {
  const { isPro, loading: planLoading } = usePlan();
  const [preset, setPreset] = useState<PresetKey>('last12');
  const initial = presetRange('last12');
  const [start, setStart] = useState(initial.start); // draft inputs (Custom)
  const [end, setEnd] = useState(initial.end);
  const [applied, setApplied] = useState(initial);   // the range actually fetched
  const [report, setReport] = useState<TimeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!applied.start || !applied.end) return; // never fire a half-cleared range
    setLoading(true);
    setError(false);
    try {
      const res = await analytics.timeReport(applied);
      setReport(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    if (isPro) fetchReport();
  }, [isPro, fetchReport]);

  const choosePreset = (key: PresetKey) => {
    setPreset(key);
    if (key !== 'custom') {
      const r = presetRange(key);
      setStart(r.start);
      setEnd(r.end);
      setApplied(r);
    }
  };

  const applyCustom = () => {
    if (start && end) setApplied({ start, end });
  };

  const downloadCsv = () => {
    if (!report) return;
    const blob = new Blob([toActivityCsv(report)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Use the server-confirmed range so the filename always matches the data.
    a.download = `skillfade-activity-${report.range.start}_to_${report.range.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-txt-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card-elevated p-8 max-w-md text-center">
          <Lock className="w-8 h-8 text-secondary-400 mx-auto mb-4" />
          <h1 className="text-display-sm text-txt-primary mb-2">A PRO feature</h1>
          <p className="text-txt-muted mb-6">The Activity Report turns your logged hours into a printable, date-range summary for appraisals, CPD logs, and client billing.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/analytics" className="btn-secondary">Back to Analytics</Link>
            <Link to="/pricing" className="btn-primary">Upgrade to PRO</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-4xl mx-auto p-6">
        {/* Toolbar — hidden when printing */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to="/analytics" className="text-sm text-txt-muted hover:text-txt-primary flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Analytics
          </Link>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="btn-secondary text-sm flex items-center gap-2"><Printer className="w-4 h-4" /> Print / Save as PDF</button>
            <button onClick={downloadCsv} disabled={!report} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"><Download className="w-4 h-4" /> Download CSV</button>
          </div>
        </div>

        <div className="no-print card-elevated p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {PRESETS.map((p) => (
              <button key={p.key} onClick={() => choosePreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${preset === p.key ? 'bg-accent-400 text-surface-50' : 'bg-surface-300 text-txt-secondary hover:bg-surface-400'}`}>
                {p.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-txt-muted">From <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} className="input ml-1 inline-block w-auto" /></label>
              <label className="text-sm text-txt-muted">To <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} className="input ml-1 inline-block w-auto" /></label>
              <button onClick={applyCustom} className="btn-secondary text-sm">Apply</button>
            </div>
          )}
        </div>

        {/* The report sheet */}
        <div className="report-print card-elevated p-8">
          <div className="flex items-center gap-3 mb-1">
            <Clock className="w-6 h-6 text-secondary-400" />
            <h1 className="text-display-sm font-display text-txt-primary">Activity Report</h1>
          </div>
          <p className="text-txt-muted text-sm mb-6">
            {fmtDate(report?.range.start ?? applied.start)} – {fmtDate(report?.range.end ?? applied.end)} · SkillFade
          </p>

          {loading && <div className="flex items-center gap-2 text-txt-muted py-8"><Loader2 className="w-5 h-5 animate-spin" /> Building report…</div>}
          {error && <p className="text-decayed-base py-8">Could not load the report. Please try again.</p>}

          {report && !loading && (
            <>
              {/* Totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <Stat label="Total hours" value={`${report.totals.hours}h`} accent />
                <Stat label="Sessions" value={String(report.totals.sessions)} />
                <Stat label="Learning" value={`${report.totals.learning_hours}h`} />
                <Stat label="Practice" value={`${report.totals.practice_hours}h`} />
              </div>
              <p className="text-xs text-txt-muted mb-8">
                Hours reflect logged durations only. {report.totals.timed_sessions} of {report.totals.sessions} sessions had a duration recorded
                ({report.totals.coverage_percent}%). First activity {fmtDate(report.totals.first_activity)}, last {fmtDate(report.totals.last_activity)}.
              </p>

              {/* Per-skill table */}
              <h2 className="label-caps text-txt-muted mb-3">By skill</h2>
              {report.per_skill.length === 0 ? (
                <p className="text-txt-muted text-sm mb-8">No activity in this period.</p>
              ) : (
                <table className="w-full text-sm mb-8 report-table">
                  <thead>
                    <tr className="text-left text-txt-muted border-b border-border">
                      <th className="py-2 pr-2 font-medium">Skill</th>
                      <th className="py-2 px-2 font-medium">Category</th>
                      <th className="py-2 px-2 font-medium text-right">Hours</th>
                      <th className="py-2 px-2 font-medium text-right">Sessions</th>
                      <th className="py-2 px-2 font-medium text-right">Learn</th>
                      <th className="py-2 px-2 font-medium text-right">Practice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.per_skill.map((s) => (
                      <tr key={s.skill_id} className="border-b border-border-subtle/50">
                        <td className="py-2 pr-2 text-txt-primary">{s.skill_name}</td>
                        <td className="py-2 px-2 text-txt-secondary">{s.category}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-primary">{s.hours}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-secondary">{s.sessions}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-secondary">{s.learning_hours}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-secondary">{s.practice_hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Per-category table */}
              {report.per_category.length > 0 && (
                <>
                  <h2 className="label-caps text-txt-muted mb-3">By category</h2>
                  <table className="w-full text-sm report-table">
                    <thead>
                      <tr className="text-left text-txt-muted border-b border-border">
                        <th className="py-2 pr-2 font-medium">Category</th>
                        <th className="py-2 px-2 font-medium text-right">Hours</th>
                        <th className="py-2 px-2 font-medium text-right">Skills</th>
                        <th className="py-2 px-2 font-medium text-right">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.per_category.map((c) => (
                        <tr key={c.category} className="border-b border-border-subtle/50">
                          <td className="py-2 pr-2 text-txt-primary">{c.category}</td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-primary">{c.hours}</td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-secondary">{c.skill_count}</td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-txt-secondary">{c.sessions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className={`p-4 rounded-lg border ${accent ? 'bg-secondary-400/10 border-secondary-400/20' : 'bg-surface-300 border-border-subtle'}`}>
    <span className="label-caps text-txt-muted">{label}</span>
    <p className={`text-2xl font-mono tabular-nums ${accent ? 'text-secondary-400' : 'text-txt-primary'}`}>{value}</p>
  </div>
);

export default ActivityReport;
