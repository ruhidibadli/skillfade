import React, { useState, useEffect, useCallback } from 'react';
import { admin } from '../../services/api';
import type { AdminEventTemplate, AdminUser } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const LEARNING_TYPES = ['reading', 'video', 'course', 'article', 'documentation', 'tutorial'];
const PRACTICE_TYPES = ['exercise', 'project', 'work', 'teaching', 'writing', 'building'];

const AdminTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<AdminEventTemplate[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterEventType, setFilterEventType] = useState<string>('');
  const pageSize = 20;

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminEventTemplate | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    event_type: 'learning',
    type: 'reading',
    default_duration_minutes: '',
    default_notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await admin.listTemplates({
        page,
        page_size: pageSize,
        search: search || undefined,
        user_id: filterUserId || undefined,
        event_type: filterEventType || undefined
      });
      setTemplates(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUserId, filterEventType]);

  const fetchUsers = async () => {
    try {
      const response = await admin.listUsers({ page_size: 100 });
      setUsers(response.data.items);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTemplates();
  };

  const getTypes = () => formData.event_type === 'learning' ? LEARNING_TYPES : PRACTICE_TYPES;

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      user_id: '',
      name: '',
      event_type: 'learning',
      type: 'reading',
      default_duration_minutes: '',
      default_notes: ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (template: AdminEventTemplate) => {
    setEditingTemplate(template);
    setFormData({
      user_id: template.user_id,
      name: template.name,
      event_type: template.event_type,
      type: template.type,
      default_duration_minutes: template.default_duration_minutes?.toString() || '',
      default_notes: template.default_notes || ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      const data: any = {
        user_id: formData.user_id,
        name: formData.name,
        event_type: formData.event_type,
        type: formData.type,
        default_duration_minutes: formData.default_duration_minutes ? parseInt(formData.default_duration_minutes) : null,
        default_notes: formData.default_notes || null
      };

      if (editingTemplate) {
        await admin.updateTemplate(editingTemplate.id, data);
      } else {
        await admin.createTemplate(data);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await admin.deleteTemplate(id);
      setDeleteConfirm(null);
      fetchTemplates();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Event Templates</h1>
          <p className="text-txt-muted text-sm mt-1">{total} total templates</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      <div className="card-elevated p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          <select
            value={filterUserId}
            onChange={(e) => { setFilterUserId(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
          <select
            value={filterEventType}
            onChange={(e) => { setFilterEventType(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Event Types</option>
            <option value="learning">Learning</option>
            <option value="practice">Practice</option>
          </select>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      {error && (
        <div className="bg-decayed-base/10 text-decayed-base px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Event Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-txt-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">Loading...</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">No templates found</td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-surface-300/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-txt-primary font-medium">{template.name}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{template.user_email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${template.event_type === 'learning' ? 'tag-accent' : 'tag-fresh'}`}>
                        {template.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{template.type}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">
                      {template.default_duration_minutes ? `${template.default_duration_minutes} min` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-muted">
                      {new Date(template.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(template)}
                          className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-accent-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === template.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(template.id)} className="p-1.5 rounded bg-decayed-base/10 text-decayed-base">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-surface-300 text-txt-muted">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(template.id)}
                            className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-decayed-base transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={pageSize} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-elevated w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-txt-primary">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-surface-300 text-txt-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-decayed-base/10 text-decayed-base px-4 py-2 rounded-lg mb-4 text-sm">{formError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">User</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1">Event Type</label>
                  <select
                    required
                    value={formData.event_type}
                    onChange={(e) => setFormData({
                      ...formData,
                      event_type: e.target.value,
                      type: e.target.value === 'learning' ? 'reading' : 'exercise'
                    })}
                    className="input-field w-full"
                  >
                    <option value="learning">Learning</option>
                    <option value="practice">Practice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field w-full"
                  >
                    {getTypes().map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Default Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.default_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, default_duration_minutes: e.target.value })}
                  className="input-field w-full"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Default Notes</label>
                <textarea
                  value={formData.default_notes}
                  onChange={(e) => setFormData({ ...formData, default_notes: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTemplates;
