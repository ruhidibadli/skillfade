import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { settings as settingsApi, templates as templatesApi } from '../services/api';
import type { EventTemplate } from '../types';
import {
  Download,
  Shield,
  Trash2,
  Plus,
  Pencil,
  X,
  BookOpen,
  Zap,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';

const Settings: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await templatesApi.list();
      setTemplates(res.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await templatesApi.delete(id);
        fetchTemplates();
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await settingsApi.export();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learning-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
      )
    ) {
      if (
        confirm(
          'This is your final warning. All your skills, events, and data will be permanently deleted. Are you absolutely sure?'
        )
      ) {
        try {
          await settingsApi.deleteAccount();
          localStorage.removeItem('token');
          navigate('/register');
        } catch (error) {
          console.error('Failed to delete account:', error);
          alert('Failed to delete account');
        }
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-md text-txt-primary mb-2">Settings</h1>
        <p className="text-txt-secondary">Manage your account and data</p>
      </div>

      {/* Event Templates Section */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent-400/10">
              <FileText className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-txt-primary">Event Templates</h2>
              <p className="text-sm text-txt-muted mt-1">
                Save common event configurations for quick re-use when logging events.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>

        {templates.length === 0 ? (
          <p className="text-txt-muted text-center py-6">
            No templates yet. Create one to speed up event logging.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex justify-between items-center p-4 bg-surface-300 rounded-lg border border-border-subtle"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${template.event_type === 'practice' ? 'bg-fresh-base/10' : 'bg-accent-400/10'}`}>
                    {template.event_type === 'practice' ? (
                      <Zap className="w-4 h-4 text-fresh-base" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-accent-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-txt-primary">{template.name}</p>
                    <p className="text-sm text-txt-muted flex items-center gap-2">
                      <span>{template.type}</span>
                      {template.default_duration_minutes && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border-DEFAULT" />
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {template.default_duration_minutes} min
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowTemplateModal(true);
                    }}
                    className="p-2 text-txt-muted hover:text-accent-400 hover:bg-surface-400 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-txt-muted hover:text-decayed-base hover:bg-surface-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Export */}
      <div className="card-elevated p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-secondary-400/10">
            <Download className="w-5 h-5 text-secondary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-txt-primary">Data Export</h2>
            <p className="text-sm text-txt-muted mt-1">
              Export all your data as a JSON file. This includes all skills, learning events, and practice events.
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary flex items-center gap-2"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export Data
            </>
          )}
        </button>
      </div>

      {/* Privacy Statement */}
      <div className="card-elevated p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-fresh-base/10">
            <Shield className="w-5 h-5 text-fresh-base" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-txt-primary">Privacy Statement</h2>
          </div>
        </div>
        <ul className="text-txt-secondary text-sm space-y-2 ml-12">
          <li>Your data is stored on your own server and is not shared with any third parties.</li>
          <li>We do not use any third-party analytics or tracking services.</li>
          <li>Your email is only used for authentication and optional alerts.</li>
          <li>You have complete ownership and control of your data.</li>
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-decayed-base/30 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-decayed-base/10">
            <Trash2 className="w-5 h-5 text-decayed-base" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-decayed-base">Danger Zone</h2>
            <p className="text-sm text-txt-muted mt-1">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="btn-danger flex items-center gap-2 ml-12"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          onSave={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
};

const TemplateModal: React.FC<{
  template: EventTemplate | null;
  onClose: () => void;
  onSave: () => void;
}> = ({ template, onClose, onSave }) => {
  const [name, setName] = useState(template?.name || '');
  const [eventType, setEventType] = useState<'learning' | 'practice'>(template?.event_type || 'practice');
  const [type, setType] = useState(template?.type || '');
  const [duration, setDuration] = useState(template?.default_duration_minutes?.toString() || '');
  const [notes, setNotes] = useState(template?.default_notes || '');
  const [error, setError] = useState('');

  const learningTypes = ['reading', 'video', 'course', 'article', 'documentation', 'tutorial'];
  const practiceTypes = ['exercise', 'project', 'work', 'teaching', 'writing', 'building'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!type) {
      setError('Event type is required');
      return;
    }

    try {
      const data = {
        name: name.trim(),
        event_type: eventType,
        type,
        default_duration_minutes: duration ? parseInt(duration) : undefined,
        default_notes: notes || undefined
      };

      if (template) {
        await templatesApi.update(template.id, data);
      } else {
        await templatesApi.create(data);
      }

      onSave();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save template');
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-txt-primary">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-txt-muted hover:text-txt-primary hover:bg-surface-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              Template Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Practice, Quick Read"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              Event Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-txt-primary cursor-pointer">
                <input
                  type="radio"
                  value="practice"
                  checked={eventType === 'practice'}
                  onChange={() => {
                    setEventType('practice');
                    setType('');
                  }}
                  className="text-accent-400"
                />
                <Zap className="w-4 h-4 text-fresh-base" />
                Practice
              </label>
              <label className="flex items-center gap-2 text-txt-primary cursor-pointer">
                <input
                  type="radio"
                  value="learning"
                  checked={eventType === 'learning'}
                  onChange={() => {
                    setEventType('learning');
                    setType('');
                  }}
                  className="text-accent-400"
                />
                <BookOpen className="w-4 h-4 text-accent-400" />
                Learning
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              Type
            </label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="select"
            >
              <option value="">Select type</option>
              {(eventType === 'practice' ? practiceTypes : learningTypes).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              Default Duration (minutes, optional)
            </label>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              Default Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {template ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
