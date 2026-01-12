import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { skills as skillsApi, events as eventsApi, analytics, templates as templatesApi } from '../services/api';
import type { Skill, Event, FreshnessHistoryPoint, EventTemplate, PersonalRecords, SkillDependencyInfo } from '../types';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
  ArrowLeft,
  Archive,
  Settings2,
  Target,
  Calendar,
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  Clock,
  FileText,
  Link2,
  Plus,
  X,
  Loader2,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

// Status Dot Component
const StatusDot: React.FC<{ freshness?: number; size?: 'sm' | 'md' | 'lg' }> = ({ freshness, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const getStatusClass = () => {
    if (!freshness) return 'bg-txt-muted';
    if (freshness > 70) return 'bg-fresh-base shadow-glow-fresh';
    if (freshness >= 40) return 'bg-aging-base shadow-glow-aging';
    return 'bg-decayed-base shadow-glow-decayed';
  };
  return <div className={`${sizeClass} rounded-full ${getStatusClass()}`} />;
};

const SkillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [freshnessHistory, setFreshnessHistory] = useState<FreshnessHistoryPoint[]>([]);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDecayModal, setShowDecayModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDependenciesModal, setShowDependenciesModal] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [skillRes, eventsRes, historyRes, templatesRes, recordsRes, allSkillsRes] = await Promise.all([
        skillsApi.get(id!),
        eventsApi.list(id!),
        analytics.freshnessHistory(id!, 90),
        templatesApi.list(),
        analytics.personalRecords(id!),
        skillsApi.list()
      ]);
      setSkill(skillRes.data);
      setEvents(eventsRes.data.events);
      setFreshnessHistory(historyRes.data.history);
      setTemplates(templatesRes.data);
      setPersonalRecords(recordsRes.data);
      setAllSkills(allSkillsRes.data.filter((s: Skill) => s.id !== id));
    } catch (error) {
      console.error('Failed to fetch skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (confirm('Are you sure you want to archive this skill?')) {
      try {
        await skillsApi.archive(id!);
        navigate('/skills');
      } catch (error) {
        console.error('Failed to archive skill:', error);
      }
    }
  };

  const getFreshnessColor = (freshness?: number) => {
    if (!freshness) return 'text-txt-muted';
    if (freshness > 70) return 'text-fresh-base';
    if (freshness >= 40) return 'text-aging-base';
    return 'text-decayed-base';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-txt-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading skill details...</span>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Target className="w-12 h-12 text-txt-muted mb-4" />
        <p className="text-txt-secondary text-lg">Skill not found</p>
        <Link to="/skills" className="btn-primary mt-4">Back to Skills</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <Link to="/skills" className="inline-flex items-center gap-1.5 text-txt-muted hover:text-accent-400 text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Skills
          </Link>
          <div className="flex items-center gap-3">
            <StatusDot freshness={skill.freshness} size="lg" />
            <h1 className="text-display-md text-txt-primary">{skill.name}</h1>
          </div>
          {skill.category && (
            <p className="text-txt-muted mt-1 ml-6">{skill.category}</p>
          )}
        </div>
        <button onClick={handleArchive} className="btn-danger flex items-center gap-2">
          <Archive className="w-4 h-4" />
          Archive
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <p className="text-xs text-txt-muted mb-1">Freshness</p>
          <p className={`text-2xl font-bold ${getFreshnessColor(skill.freshness)}`}>
            {skill.freshness?.toFixed(0)}%
          </p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-xs text-txt-muted mb-1">Days Since Practice</p>
          <p className="text-2xl font-bold text-txt-primary">{skill.days_since_practice}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen className="w-3 h-3 text-accent-400" />
            <p className="text-xs text-txt-muted">Learning Events</p>
          </div>
          <p className="text-2xl font-bold text-accent-400">{skill.learning_count}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-fresh-base" />
            <p className="text-xs text-txt-muted">Practice Events</p>
          </div>
          <p className="text-2xl font-bold text-fresh-base">{skill.practice_count}</p>
        </div>
      </div>

      {/* Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-txt-primary">Decay Rate</p>
            <p className="text-xs text-txt-muted">
              {((skill.decay_rate || 0.02) * 100).toFixed(1)}% per day
              {skill.decay_rate === 0.02 && ' (default)'}
            </p>
          </div>
          <button onClick={() => setShowDecayModal(true)} className="btn-ghost text-sm flex items-center gap-1">
            <Settings2 className="w-4 h-4" /> Adjust
          </button>
        </div>
        <div className="card p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-txt-primary">Freshness Target</p>
            <p className="text-xs text-txt-muted">
              {skill.target_freshness !== null ? (
                <>
                  {skill.target_freshness}%
                  {skill.below_target && (
                    <span className="ml-2 text-aging-base flex items-center gap-1 inline-flex">
                      <AlertTriangle className="w-3 h-3" /> Below target
                    </span>
                  )}
                </>
              ) : 'Not set'}
            </p>
          </div>
          <button onClick={() => setShowTargetModal(true)} className="btn-ghost text-sm flex items-center gap-1">
            <Target className="w-4 h-4" /> {skill.target_freshness !== null ? 'Adjust' : 'Set'}
          </button>
        </div>
      </div>

      {/* Notes Section */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-accent-400 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-txt-primary">Notes</h2>
              <p className="text-xs text-txt-muted">Resources, goals, and context</p>
            </div>
          </div>
          <button onClick={() => setShowNotesModal(true)} className="btn-ghost text-sm">Edit</button>
        </div>
        {skill.notes ? (
          <p className="text-txt-secondary whitespace-pre-wrap text-sm ml-8">{skill.notes}</p>
        ) : (
          <p className="text-txt-muted italic text-sm ml-8">No notes yet. Click Edit to add resources or context.</p>
        )}
      </div>

      {/* Dependencies Section */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <Link2 className="w-5 h-5 text-secondary-400 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-txt-primary">Dependencies</h2>
              <p className="text-xs text-txt-muted">Prerequisite skills for this one</p>
            </div>
          </div>
          <button onClick={() => setShowDependenciesModal(true)} className="btn-ghost text-sm">Manage</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8">
          <div>
            <p className="text-xs text-txt-muted mb-2">Prerequisites ({skill.dependencies?.length || 0})</p>
            {skill.dependencies && skill.dependencies.length > 0 ? (
              <div className="space-y-2">
                {skill.dependencies.map((dep) => (
                  <Link key={dep.id} to={`/skills/${dep.id}`} className="flex items-center justify-between p-2 bg-surface-300 rounded-lg hover:bg-surface-400 transition-colors">
                    <span className="text-txt-primary text-sm">{dep.name}</span>
                    <span className={`text-sm font-medium ${getFreshnessColor(dep.freshness)}`}>
                      {dep.freshness?.toFixed(0)}%
                      {dep.below_target && <AlertTriangle className="w-3 h-3 ml-1 inline text-aging-base" />}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-txt-muted italic">No prerequisites defined</p>
            )}
          </div>
          <div>
            <p className="text-xs text-txt-muted mb-2">Required By ({skill.dependents?.length || 0})</p>
            {skill.dependents && skill.dependents.length > 0 ? (
              <div className="space-y-2">
                {skill.dependents.map((dep) => (
                  <Link key={dep.id} to={`/skills/${dep.id}`} className="flex items-center justify-between p-2 bg-surface-300 rounded-lg hover:bg-surface-400 transition-colors">
                    <span className="text-txt-primary text-sm">{dep.name}</span>
                    <span className={`text-sm font-medium ${getFreshnessColor(dep.freshness)}`}>{dep.freshness?.toFixed(0)}%</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-txt-muted italic">No skills depend on this</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Records */}
      {personalRecords && (
        <div className="card-elevated p-6">
          <div className="flex items-start gap-3 mb-4">
            <Award className="w-5 h-5 text-aging-base mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-txt-primary">Personal Records</h2>
              <p className="text-xs text-txt-muted">Insights about your journey</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-8">
            <div className="p-3 bg-fresh-base/10 rounded-lg border border-fresh-base/20">
              <p className="text-2xl font-bold text-fresh-base">{personalRecords.longest_fresh_streak_days}</p>
              <p className="text-xs text-txt-muted">Longest Fresh Streak (days)</p>
              {personalRecords.longest_fresh_streak_start && (
                <p className="text-xs text-txt-muted mt-1 opacity-70">
                  {format(new Date(personalRecords.longest_fresh_streak_start), 'MMM d')} - {format(new Date(personalRecords.longest_fresh_streak_end!), 'MMM d, yyyy')}
                </p>
              )}
            </div>
            <div className="p-3 bg-accent-400/10 rounded-lg border border-accent-400/20">
              <p className="text-2xl font-bold text-accent-400">{personalRecords.peak_freshness}%</p>
              <p className="text-xs text-txt-muted">Peak Freshness</p>
              {personalRecords.peak_freshness_date && (
                <p className="text-xs text-txt-muted mt-1 opacity-70">{format(new Date(personalRecords.peak_freshness_date), 'MMM d, yyyy')}</p>
              )}
            </div>
            <div className="p-3 bg-secondary-400/10 rounded-lg border border-secondary-400/20">
              <p className="text-2xl font-bold text-secondary-400">{personalRecords.most_active_week_events}</p>
              <p className="text-xs text-txt-muted">Most Active Week</p>
              {personalRecords.most_active_week_start && (
                <p className="text-xs text-txt-muted mt-1 opacity-70">Week of {format(new Date(personalRecords.most_active_week_start), 'MMM d, yyyy')}</p>
              )}
            </div>
            <div className="p-3 bg-aging-base/10 rounded-lg border border-aging-base/20">
              <p className="text-2xl font-bold text-aging-base">{personalRecords.longest_gap_recovered_days}</p>
              <p className="text-xs text-txt-muted">Longest Gap Recovered</p>
              <p className="text-xs text-txt-muted mt-1 opacity-70">Between practice sessions</p>
            </div>
          </div>
        </div>
      )}

      {/* Freshness History Chart */}
      {freshnessHistory.length > 0 && (
        <div className="card-elevated p-6">
          <div className="flex items-start gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-400 mt-0.5" />
            <h2 className="text-lg font-semibold text-txt-primary">Freshness History (90 Days)</h2>
          </div>
          <div className="h-64 ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={freshnessHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={{ stroke: '#27272a' }} />
                <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={(value) => `${value}%`} axisLine={{ stroke: '#27272a' }} />
                <Tooltip labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Freshness']} contentStyle={{ backgroundColor: '#16161d', border: '1px solid #3f3f46', borderRadius: '8px' }} labelStyle={{ color: '#a1a1aa' }} itemStyle={{ color: '#f4f4f5' }} />
                <ReferenceLine y={70} stroke="#10b981" strokeDasharray="5 5" strokeOpacity={0.5} />
                <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
                <Line type="monotone" dataKey="freshness" stroke="#00fff0" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00fff0', stroke: '#0a0a0f', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs ml-8">
            <span className="flex items-center gap-2"><span className="status-fresh" /> Fresh (&gt;70%)</span>
            <span className="flex items-center gap-2"><span className="status-aging" /> Aging (40-70%)</span>
            <span className="flex items-center gap-2"><span className="status-decayed" /> Decayed (&lt;40%)</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-txt-muted mt-0.5" />
            <h2 className="text-lg font-semibold text-txt-primary">Timeline</h2>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
        {events.length === 0 ? (
          <p className="text-center text-txt-muted py-8">No events yet. Add your first event above.</p>
        ) : (
          <div className="space-y-4 ml-8">
            {events.map((event) => (
              <div key={event.id} className={`relative pl-8 pb-4 border-l-2 ${event.event_type === 'practice' ? 'border-fresh-base/30' : 'border-accent-400/30'}`}>
                <div className={`absolute left-[-9px] w-4 h-4 rounded-full flex items-center justify-center ${event.event_type === 'practice' ? 'bg-fresh-base' : 'bg-accent-400'}`}>
                  {event.event_type === 'practice' ? <Zap className="w-2 h-2 text-surface-50" /> : <BookOpen className="w-2 h-2 text-surface-50" />}
                </div>
                <div className="card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-txt-primary">{event.event_type === 'practice' ? 'Practice' : 'Learning'}: {event.type}</p>
                      <p className="text-xs text-txt-muted mt-1">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                      {event.notes && <p className="text-sm text-txt-secondary mt-2">{event.notes}</p>}
                    </div>
                    {event.duration_minutes && (
                      <span className="tag flex items-center gap-1"><Clock className="w-3 h-3" />{event.duration_minutes}m</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddEventModal skillId={id!} templates={templates} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} />}
      {showDecayModal && <DecayRateModal currentRate={skill.decay_rate || 0.02} onClose={() => setShowDecayModal(false)} onSave={async (newRate) => { await skillsApi.update(id!, { decay_rate: newRate }); setShowDecayModal(false); fetchData(); }} />}
      {showTargetModal && <TargetFreshnessModal currentTarget={skill.target_freshness} onClose={() => setShowTargetModal(false)} onSave={async (newTarget) => { await skillsApi.update(id!, { target_freshness: newTarget }); setShowTargetModal(false); fetchData(); }} />}
      {showNotesModal && <NotesModal currentNotes={skill.notes} onClose={() => setShowNotesModal(false)} onSave={async (newNotes) => { await skillsApi.update(id!, { notes: newNotes }); setShowNotesModal(false); fetchData(); }} />}
      {showDependenciesModal && <DependenciesModal currentDependencies={skill.dependencies || []} availableSkills={allSkills} onClose={() => setShowDependenciesModal(false)} onSave={async (dependencyIds) => { await skillsApi.updateDependencies(id!, dependencyIds); setShowDependenciesModal(false); fetchData(); }} />}
    </div>
  );
};

const AddEventModal: React.FC<{ skillId: string; templates: EventTemplate[]; onClose: () => void; onSuccess: () => void; }> = ({ skillId, templates, onClose, onSuccess }) => {
  const [eventType, setEventType] = useState<'learning' | 'practice'>('practice');
  const [subType, setSubType] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const filteredTemplates = templates.filter(t => t.event_type === eventType);
  const applyTemplate = (template: EventTemplate) => { setSubType(template.type); if (template.default_duration_minutes) setDuration(template.default_duration_minutes.toString()); if (template.default_notes) setNotes(template.default_notes); };
  const learningTypes = ['reading', 'video', 'course', 'article', 'documentation', 'tutorial'];
  const practiceTypes = ['exercise', 'project', 'work', 'teaching', 'writing', 'building'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const eventData = { date, type: subType, notes: notes || undefined, duration_minutes: duration ? parseInt(duration) : undefined };
      if (eventType === 'practice') await eventsApi.createPractice(skillId, eventData);
      else await eventsApi.createLearning(skillId, eventData);
      window.dispatchEvent(new Event('dashboard-refresh'));
      onSuccess();
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to add event'); }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-txt-primary">Add Event</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">Event Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setEventType('practice'); setSubType(''); }} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${eventType === 'practice' ? 'bg-fresh-base text-surface-50 shadow-glow-fresh' : 'bg-surface-300 text-txt-secondary hover:bg-surface-400 border border-border-subtle'}`}><Zap className="w-4 h-4" />Practice</button>
              <button type="button" onClick={() => { setEventType('learning'); setSubType(''); }} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${eventType === 'learning' ? 'bg-accent-400 text-surface-50 shadow-glow-accent' : 'bg-surface-300 text-txt-secondary hover:bg-surface-400 border border-border-subtle'}`}><BookOpen className="w-4 h-4" />Learning</button>
            </div>
          </div>
          {filteredTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">{filteredTemplates.map((template) => (<button key={template.id} type="button" onClick={() => applyTemplate(template)} className="tag hover:bg-surface-400 hover:border-accent-400/30 transition-colors cursor-pointer">{template.name}</button>))}</div>
            </div>
          )}
          <div><label className="block text-sm font-medium text-txt-secondary mb-2">Type</label><select required value={subType} onChange={(e) => setSubType(e.target.value)} className="select"><option value="">Select type</option>{(eventType === 'practice' ? practiceTypes : learningTypes).map((type) => (<option key={type} value={type}>{type}</option>))}</select></div>
          <div><label className="block text-sm font-medium text-txt-secondary mb-2">Date</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} className="input" /></div>
          <div><label className="block text-sm font-medium text-txt-secondary mb-2">Notes (optional)</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={3} className="input" /></div>
          <div><label className="block text-sm font-medium text-txt-secondary mb-2">Duration (minutes, optional)</label><input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} className="input" /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Add Event</button></div>
        </form>
      </div>
    </div>
  );
};

const DecayRateModal: React.FC<{ currentRate: number; onClose: () => void; onSave: (rate: number) => void; }> = ({ currentRate, onClose, onSave }) => {
  const [rate, setRate] = useState((currentRate * 100).toFixed(1));
  const [error, setError] = useState('');
  const presets = [{ label: 'Slow (Language)', rate: 0.01 }, { label: 'Normal (Technical)', rate: 0.02 }, { label: 'Fast (Procedural)', rate: 0.03 }, { label: 'Very Fast', rate: 0.05 }];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const numRate = parseFloat(rate) / 100; if (isNaN(numRate) || numRate < 0.001 || numRate > 0.5) { setError('Rate must be between 0.1% and 50%'); return; } onSave(numRate); };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-txt-primary">Adjust Decay Rate</h2><button onClick={onClose} className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"><X className="w-5 h-5" /></button></div>
        <p className="text-sm text-txt-muted mb-4">The decay rate determines how quickly this skill's freshness decreases without practice.</p>
        {error && <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <div className="mb-4"><label className="block text-sm font-medium text-txt-secondary mb-2">Presets</label><div className="grid grid-cols-2 gap-2">{presets.map((preset) => (<button key={preset.rate} type="button" onClick={() => setRate((preset.rate * 100).toFixed(1))} className={`px-3 py-2 text-sm rounded-lg border transition-colors ${parseFloat(rate) === preset.rate * 100 ? 'border-accent-400 bg-accent-400/10 text-accent-400' : 'border-border-subtle bg-surface-300 text-txt-secondary hover:bg-surface-400'}`}>{preset.label}<br /><span className="text-xs opacity-70">{(preset.rate * 100).toFixed(1)}%/day</span></button>))}</div></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-txt-secondary mb-2">Custom Rate (% per day)</label><input type="number" step="0.1" min="0.1" max="50" value={rate} onChange={(e) => setRate(e.target.value)} className="input" /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
        </form>
      </div>
    </div>
  );
};

const TargetFreshnessModal: React.FC<{ currentTarget: number | null; onClose: () => void; onSave: (target: number) => void; }> = ({ currentTarget, onClose, onSave }) => {
  const [target, setTarget] = useState(currentTarget?.toString() || '70');
  const [error, setError] = useState('');
  const presets = [{ label: 'Relaxed', value: 50, desc: 'Rarely-used skills' }, { label: 'Standard', value: 70, desc: 'Most skills' }, { label: 'Strict', value: 85, desc: 'Critical skills' }, { label: 'Perfect', value: 95, desc: 'Maximum goal' }];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const numTarget = parseFloat(target); if (isNaN(numTarget) || numTarget < 0 || numTarget > 100) { setError('Target must be between 0% and 100%'); return; } onSave(numTarget); };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-txt-primary">Set Freshness Target</h2><button onClick={onClose} className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"><X className="w-5 h-5" /></button></div>
        <p className="text-sm text-txt-muted mb-4">Set a personal freshness threshold. You'll see an indicator when the skill falls below your target.</p>
        {error && <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        <div className="mb-4"><label className="block text-sm font-medium text-txt-secondary mb-2">Presets</label><div className="grid grid-cols-2 gap-2">{presets.map((preset) => (<button key={preset.value} type="button" onClick={() => setTarget(preset.value.toString())} className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${parseFloat(target) === preset.value ? 'border-accent-400 bg-accent-400/10 text-accent-400' : 'border-border-subtle bg-surface-300 text-txt-secondary hover:bg-surface-400'}`}><span className="font-medium">{preset.label}</span> <span className="text-xs opacity-70">({preset.value}%)</span><p className="text-xs opacity-60 mt-0.5">{preset.desc}</p></button>))}</div></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-txt-secondary mb-2">Custom Target (%)</label><input type="number" step="1" min="0" max="100" value={target} onChange={(e) => setTarget(e.target.value)} className="input" /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save</button></div>
        </form>
      </div>
    </div>
  );
};

const NotesModal: React.FC<{ currentNotes: string | null; onClose: () => void; onSave: (notes: string) => void; }> = ({ currentNotes, onClose, onSave }) => {
  const [notes, setNotes] = useState(currentNotes || '');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(notes); };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in max-w-2xl">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-txt-primary">Edit Notes</h2><button onClick={onClose} className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"><X className="w-5 h-5" /></button></div>
        <p className="text-sm text-txt-muted mb-4">Add resources, goals, learning materials, or any context you want to remember.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={10} placeholder="Example:&#10;&#10;Learning Resources:&#10;- Official documentation&#10;- Book: The Pragmatic Programmer&#10;&#10;Goals:&#10;- Build a portfolio project&#10;- Get certified by Q2" className="input font-mono text-sm" />
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Notes</button></div>
        </form>
      </div>
    </div>
  );
};

const DependenciesModal: React.FC<{ currentDependencies: SkillDependencyInfo[]; availableSkills: Skill[]; onClose: () => void; onSave: (dependencyIds: string[]) => void; }> = ({ currentDependencies, availableSkills, onClose, onSave }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(currentDependencies.map(d => d.id));
  const toggleSkill = (skillId: string) => { setSelectedIds(prev => prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(selectedIds); };
  const getFreshnessColor = (freshness?: number) => { if (!freshness) return 'text-txt-muted'; if (freshness > 70) return 'text-fresh-base'; if (freshness >= 40) return 'text-aging-base'; return 'text-decayed-base'; };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold text-txt-primary">Manage Dependencies</h2><button onClick={onClose} className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"><X className="w-5 h-5" /></button></div>
        <p className="text-sm text-txt-muted mb-4">Select skills that are prerequisites. You'll see alerts when foundation skills are decaying.</p>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto border border-border-subtle rounded-lg mb-4">
            {availableSkills.length === 0 ? (<p className="p-4 text-center text-txt-muted">No other skills available.</p>) : (
              <div className="divide-y divide-border-subtle">{availableSkills.map((skill) => (<label key={skill.id} className="flex items-center justify-between p-3 hover:bg-surface-300 cursor-pointer transition-colors"><div className="flex items-center gap-3"><input type="checkbox" checked={selectedIds.includes(skill.id)} onChange={() => toggleSkill(skill.id)} className="h-4 w-4 text-accent-400 rounded border-border focus:ring-accent-400 bg-surface-300" /><div><span className="text-txt-primary font-medium">{skill.name}</span>{skill.category && <span className="ml-2 text-xs text-txt-muted">({skill.category})</span>}</div></div><span className={`text-sm font-medium ${getFreshnessColor(skill.freshness)}`}>{skill.freshness?.toFixed(0)}%</span></label>))}</div>
            )}
          </div>
          <div className="flex justify-between items-center"><span className="text-sm text-txt-muted">{selectedIds.length} selected</span><div className="flex gap-3"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Save Dependencies</button></div></div>
        </form>
      </div>
    </div>
  );
};

export default SkillDetail;
