import React, { useEffect, useState } from 'react';
import { analytics } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BalanceData, FreshnessData, CalendarData, CalendarEvent, PeriodComparison, CategoryStatsData } from '../types';
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Zap,
  Scale,
  TrendingUp,
  TrendingDown,
  Folder,
  Loader2,
  Clock
} from 'lucide-react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Analytics: React.FC = () => {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [freshnessData, setFreshnessData] = useState<FreshnessData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [periodComparison, setPeriodComparison] = useState<PeriodComparison | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [period]);
  useEffect(() => { fetchCalendarData(); }, [calendarMonth, calendarYear]);

  const fetchData = async () => {
    try {
      const [balanceRes, freshnessRes, comparisonRes, categoryRes] = await Promise.all([
        analytics.balance(period), analytics.skillsByFreshness(), analytics.periodComparison(), analytics.categoryStats()
      ]);
      setBalanceData(balanceRes.data); setFreshnessData(freshnessRes.data); setPeriodComparison(comparisonRes.data); setCategoryStats(categoryRes.data);
    } catch (error) { console.error('Failed to fetch analytics:', error); }
    finally { setLoading(false); }
  };

  const fetchCalendarData = async () => {
    try { const res = await analytics.calendar(calendarMonth, calendarYear); setCalendarData(res.data); }
    catch (error) { console.error('Failed to fetch calendar data:', error); }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay();
  const formatDateKey = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const goToPreviousMonth = () => { if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(calendarYear - 1); } else { setCalendarMonth(calendarMonth - 1); } setSelectedDate(null); };
  const goToNextMonth = () => { if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(calendarYear + 1); } else { setCalendarMonth(calendarMonth + 1); } setSelectedDate(null); };
  const goToToday = () => { const today = new Date(); setCalendarMonth(today.getMonth() + 1); setCalendarYear(today.getFullYear()); setSelectedDate(null); };

  const renderCalendar = () => {
    if (!calendarData) return null;
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const today = new Date();
    const todayStr = formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const days = [];

    for (let i = 0; i < firstDay; i++) { days.push(<div key={`empty-${i}`} className="h-20 bg-surface-200/50"></div>); }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(calendarYear, calendarMonth, day);
      const events = calendarData.events_by_date[dateKey] || [];
      const learningCount = events.filter(e => e.event_type === 'learning').length;
      const practiceCount = events.filter(e => e.event_type === 'practice').length;
      const isToday = dateKey === todayStr;
      const isSelected = dateKey === selectedDate;

      days.push(
        <div key={day} onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
          className={`h-20 p-2 cursor-pointer transition-all rounded-lg border ${isToday ? 'bg-accent-400/10 border-accent-400/30' : 'bg-surface-200 border-border-subtle hover:bg-surface-300'} ${isSelected ? 'ring-2 ring-accent-400/50' : ''}`}>
          <div className={`text-sm font-medium mb-1.5 ${isToday ? 'text-accent-400' : 'text-txt-primary'}`}>{day}</div>
          {events.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {learningCount > 0 && <div className="flex items-center gap-1 text-[10px] text-accent-400"><BookOpen className="w-2.5 h-2.5" />{learningCount}</div>}
              {practiceCount > 0 && <div className="flex items-center gap-1 text-[10px] text-fresh-base"><Zap className="w-2.5 h-2.5" />{practiceCount}</div>}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const renderSelectedDateEvents = () => {
    if (!selectedDate || !calendarData) return null;
    const events = calendarData.events_by_date[selectedDate] || [];
    if (events.length === 0) return <div className="mt-4 p-4 bg-surface-300 rounded-lg border border-border-subtle"><p className="text-txt-muted text-center text-sm">No activity on this date</p></div>;

    const learningEvents = events.filter(e => e.event_type === 'learning');
    const practiceEvents = events.filter(e => e.event_type === 'practice');
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="mt-4 card-elevated p-4 animate-slide-down">
        <h3 className="text-lg font-semibold text-txt-primary mb-3">{formatDate(selectedDate)}</h3>
        {learningEvents.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-accent-400 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4" />Learning Events ({learningEvents.length})</h4>
            <div className="space-y-2">{learningEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
          </div>
        )}
        {practiceEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-fresh-base mb-2 flex items-center gap-2"><Zap className="w-4 h-4" />Practice Events ({practiceEvents.length})</h4>
            <div className="space-y-2">{practiceEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="flex items-center gap-3 text-txt-muted"><Loader2 className="w-5 h-5 animate-spin" /><span>Loading analytics...</span></div></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-display-md text-txt-primary mb-2">Analytics</h1>
        <p className="text-txt-secondary">Data about your learning patterns</p>
      </div>

      {/* Activity Calendar */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-accent-400" /><h2 className="text-lg font-semibold text-txt-primary">Activity Calendar</h2></div>
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousMonth} className="p-2 rounded-lg hover:bg-surface-300 text-txt-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-txt-primary font-medium min-w-[150px] text-center">{MONTH_NAMES[calendarMonth - 1]} {calendarYear}</span>
            <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-surface-300 text-txt-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={goToToday} className="ml-2 btn-primary text-sm py-1.5">Today</button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs text-txt-muted">
          <div className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-accent-400" />Learning</div>
          <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-fresh-base" />Practice</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map(day => <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-txt-muted">{day}</div>)}
          {renderCalendar()}
        </div>
        {renderSelectedDateEvents()}
      </div>

      {/* Balance Chart */}
      {balanceData && (
        <div className="card-elevated p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3"><Scale className="w-5 h-5 text-secondary-400" /><h2 className="text-lg font-semibold text-txt-primary">Input/Output Balance</h2></div>
            <div className="flex gap-1">
              {(['week', 'month', 'quarter'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p ? 'bg-accent-400 text-surface-50 shadow-glow-accent' : 'bg-surface-300 text-txt-secondary hover:bg-surface-400'}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-accent-400/10 rounded-lg border border-accent-400/20">
              <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-accent-400" /><span className="text-xs text-txt-muted">Total Learning</span></div>
              <p className="text-2xl font-bold text-accent-400">{balanceData.total_learning}</p>
            </div>
            <div className="p-4 bg-fresh-base/10 rounded-lg border border-fresh-base/20">
              <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-fresh-base" /><span className="text-xs text-txt-muted">Total Practice</span></div>
              <p className="text-2xl font-bold text-fresh-base">{balanceData.total_practice}</p>
            </div>
            <div className="p-4 bg-secondary-400/10 rounded-lg border border-secondary-400/20">
              <div className="flex items-center gap-2 mb-1"><Scale className="w-4 h-4 text-secondary-400" /><span className="text-xs text-txt-muted">Balance Ratio</span></div>
              <p className="text-2xl font-bold text-secondary-400">{balanceData.balance_ratio}</p>
              <p className="text-xs text-txt-muted mt-1">{balanceData.interpretation}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="#27272a" />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} stroke="#27272a" />
              <Tooltip contentStyle={{ backgroundColor: '#16161d', border: '1px solid #3f3f46', borderRadius: '8px' }} labelStyle={{ color: '#a1a1aa' }} itemStyle={{ color: '#f4f4f5' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="learning" stroke="#00fff0" name="Learning" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="practice" stroke="#10b981" name="Practice" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Freshness Distribution */}
      {freshnessData && (
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6"><BarChart3 className="w-5 h-5 text-aging-base" /><h2 className="text-lg font-semibold text-txt-primary">Skills by Freshness</h2></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={freshnessData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#71717a' }} stroke="#27272a" />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} stroke="#27272a" />
              <Tooltip contentStyle={{ backgroundColor: '#16161d', border: '1px solid #3f3f46', borderRadius: '8px' }} labelStyle={{ color: '#a1a1aa' }} itemStyle={{ color: '#f4f4f5' }} />
              <Bar dataKey="count" fill="#00fff0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Period Comparison */}
      {periodComparison && (
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-5 h-5 text-fresh-base" /><h2 className="text-lg font-semibold text-txt-primary">Month-over-Month Comparison</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-accent-400/10 rounded-lg border border-accent-400/20">
              <h3 className="text-sm font-medium text-accent-400 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-txt-muted text-sm">Learning</span><span className="font-bold text-txt-primary">{periodComparison.current_month.learning}</span></div>
                <div className="flex justify-between"><span className="text-txt-muted text-sm">Practice</span><span className="font-bold text-txt-primary">{periodComparison.current_month.practice}</span></div>
                <div className="flex justify-between"><span className="text-txt-muted text-sm">Total</span><span className="font-bold text-txt-primary">{periodComparison.current_month.total}</span></div>
                <div className="flex justify-between pt-2 border-t border-accent-400/20"><span className="text-txt-muted text-sm">Balance</span><span className="font-bold text-accent-400">{periodComparison.current_month.ratio}</span></div>
                <p className="text-xs text-txt-muted">{periodComparison.current_month.interpretation}</p>
              </div>
            </div>
            <div className="p-4 bg-surface-300 rounded-lg border border-border-subtle">
              <h3 className="text-sm font-medium text-txt-secondary mb-4">Last Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-txt-muted text-sm">Learning</span><span className="font-bold text-txt-primary">{periodComparison.last_month.learning}</span></div>
                <div className="flex justify-between"><span className="text-txt-muted text-sm">Practice</span><span className="font-bold text-txt-primary">{periodComparison.last_month.practice}</span></div>
                <div className="flex justify-between"><span className="text-txt-muted text-sm">Total</span><span className="font-bold text-txt-primary">{periodComparison.last_month.total}</span></div>
                <div className="flex justify-between pt-2 border-t border-border-subtle"><span className="text-txt-muted text-sm">Balance</span><span className="font-bold text-txt-primary">{periodComparison.last_month.ratio}</span></div>
                <p className="text-xs text-txt-muted">{periodComparison.last_month.interpretation}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-aging-base/10 rounded-lg border border-aging-base/20">
            <h3 className="text-sm font-medium text-aging-base mb-3">Changes</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-txt-primary">{periodComparison.changes.learning >= 0 ? '+' : ''}{periodComparison.changes.learning}</p>
                <p className="text-xs text-txt-muted">Learning</p>
                <p className={`text-xs flex items-center justify-center gap-1 ${periodComparison.changes.learning_percent >= 0 ? 'text-fresh-base' : 'text-decayed-base'}`}>
                  {periodComparison.changes.learning_percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{Math.abs(periodComparison.changes.learning_percent)}%
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-txt-primary">{periodComparison.changes.practice >= 0 ? '+' : ''}{periodComparison.changes.practice}</p>
                <p className="text-xs text-txt-muted">Practice</p>
                <p className={`text-xs flex items-center justify-center gap-1 ${periodComparison.changes.practice_percent >= 0 ? 'text-fresh-base' : 'text-decayed-base'}`}>
                  {periodComparison.changes.practice_percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{Math.abs(periodComparison.changes.practice_percent)}%
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-txt-primary">{periodComparison.changes.total >= 0 ? '+' : ''}{periodComparison.changes.total}</p>
                <p className="text-xs text-txt-muted">Total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Stats */}
      {categoryStats && categoryStats.categories.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-2"><Folder className="w-5 h-5 text-secondary-400" /><h2 className="text-lg font-semibold text-txt-primary">Skills by Category</h2></div>
          <p className="text-xs text-txt-muted mb-6">Sorted by average freshness (lowest first)</p>
          <div className="space-y-4">
            {categoryStats.categories.map((cat) => (
              <div key={cat.category} className="p-4 bg-surface-300 rounded-lg border border-border-subtle">
                <div className="flex justify-between items-start mb-3">
                  <div><h3 className="text-lg font-medium text-txt-primary">{cat.category}</h3><p className="text-xs text-txt-muted">{cat.skill_count} skill{cat.skill_count !== 1 ? 's' : ''}</p></div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${cat.average_freshness > 70 ? 'text-fresh-base' : cat.average_freshness >= 40 ? 'text-aging-base' : 'text-decayed-base'}`}>{cat.average_freshness}%</p>
                    <p className="text-xs text-txt-muted">avg freshness</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-accent-400/10 rounded-lg"><p className="font-bold text-accent-400">{cat.total_learning}</p><p className="text-xs text-txt-muted">Learning</p></div>
                  <div className="text-center p-2 bg-fresh-base/10 rounded-lg"><p className="font-bold text-fresh-base">{cat.total_practice}</p><p className="text-xs text-txt-muted">Practice</p></div>
                  <div className="text-center p-2 bg-surface-400 rounded-lg"><p className="font-bold text-txt-primary">{cat.total_events}</p><p className="text-xs text-txt-muted">Total</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">{cat.skills.map((skill) => <span key={skill} className="tag text-xs">{skill}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EventCard: React.FC<{ event: CalendarEvent }> = ({ event }) => (
  <div className="p-3 bg-surface-300 rounded-lg border border-border-subtle">
    <div className="flex justify-between items-start">
      <div><p className="font-medium text-txt-primary text-sm">{event.skill_name}</p><p className="text-xs text-txt-muted capitalize">{event.type}</p></div>
      {event.duration_minutes && <span className="tag text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{event.duration_minutes}m</span>}
    </div>
    {event.notes && <p className="mt-2 text-xs text-txt-secondary">{event.notes}</p>}
  </div>
);

export default Analytics;
