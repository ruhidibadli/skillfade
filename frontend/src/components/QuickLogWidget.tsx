import React, { useState, useEffect } from 'react';
import { skills as skillsApi, events as eventsApi, templates as templatesApi } from '../services/api';
import type { Skill, EventTemplate, LearningEventType, PracticeEventType } from '../types';
import { format } from 'date-fns';
import {
  Plus,
  X,
  Zap,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Check
} from 'lucide-react';

const QuickLogWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [eventType, setEventType] = useState<'learning' | 'practice'>('practice');
  const [subType, setSubType] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const learningTypes = ['reading', 'video', 'course', 'article', 'documentation', 'tutorial'];
  const practiceTypes = ['exercise', 'project', 'work', 'teaching', 'writing', 'building'];

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [skillsRes, templatesRes] = await Promise.all([
        skillsApi.list(),
        templatesApi.list()
      ]);
      setSkills(skillsRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const applyTemplate = (template: EventTemplate) => {
    setEventType(template.event_type);
    setSubType(template.type);
    if (template.default_duration_minutes) {
      setDuration(template.default_duration_minutes.toString());
    }
    if (template.default_notes) {
      setNotes(template.default_notes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedSkill) {
      setError('Please select a skill');
      setLoading(false);
      return;
    }

    if (!subType) {
      setError('Please select an event type');
      setLoading(false);
      return;
    }

    try {
      if (eventType === 'practice') {
        await eventsApi.createPractice(selectedSkill, {
          date,
          type: subType as PracticeEventType,
          notes: notes || undefined,
          duration_minutes: duration ? parseInt(duration) : undefined
        });
      } else {
        await eventsApi.createLearning(selectedSkill, {
          date,
          type: subType as LearningEventType,
          notes: notes || undefined,
          duration_minutes: duration ? parseInt(duration) : undefined
        });
      }

      window.dispatchEvent(new Event('dashboard-refresh'));

      setSuccess('Event logged successfully!');

      setSubType('');
      setNotes('');
      setDuration('');
      setDate(format(new Date(), 'yyyy-MM-dd'));

      setTimeout(() => {
        setSuccess('');
        setIsOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => t.event_type === eventType);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14
                   bg-gradient-to-br from-accent-400 to-secondary-400
                   text-surface-50 rounded-full
                   shadow-glow-accent hover:shadow-glow-accent-lg
                   transition-all duration-300
                   flex items-center justify-center z-50
                   hover:scale-105 active:scale-95"
        aria-label="Quick Log"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-content p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-txt-primary">Quick Log</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm animate-slide-down">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-fresh-base/10 border border-fresh-base/30 text-fresh-base px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2 animate-slide-down">
                <Check className="w-4 h-4" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Skill Selection */}
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2">
                  Skill
                </label>
                <select
                  required
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="select"
                >
                  <option value="">Select skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2">
                  Event Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('practice');
                      setSubType('');
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      eventType === 'practice'
                        ? 'bg-fresh-base text-surface-50 shadow-glow-fresh'
                        : 'bg-surface-300 text-txt-secondary hover:bg-surface-400 border border-border-subtle'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEventType('learning');
                      setSubType('');
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      eventType === 'learning'
                        ? 'bg-accent-400 text-surface-50 shadow-glow-accent'
                        : 'bg-surface-300 text-txt-secondary hover:bg-surface-400 border border-border-subtle'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Learning
                  </button>
                </div>
              </div>

              {/* Templates */}
              {filteredTemplates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-2">
                    Quick Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="tag hover:bg-surface-400 hover:border-accent-400/30 transition-colors cursor-pointer"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2">
                  Type
                </label>
                <select
                  required
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="select"
                >
                  <option value="">Select type</option>
                  {(eventType === 'practice' ? practiceTypes : learningTypes).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="input"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Optional"
                  className="input"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Optional"
                  className="input"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Log Event
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickLogWidget;
