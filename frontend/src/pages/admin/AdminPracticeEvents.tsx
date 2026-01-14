import React, { useState, useEffect, useCallback } from 'react';
import { admin } from '../../services/api';
import type { AdminPracticeEvent, AdminUser, AdminSkill } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const PRACTICE_TYPES = ['exercise', 'project', 'work', 'teaching', 'writing', 'building'];

const AdminPracticeEvents: React.FC = () => {
  const [events, setEvents] = useState<AdminPracticeEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterSkillId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const pageSize = 20;

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminPracticeEvent | null>(null);
  const [formData, setFormData] = useState({
    skill_id: '',
    user_id: '',
    date: '',
    type: 'exercise',
    notes: '',
    duration_minutes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await admin.listPracticeEvents({
        page,
        page_size: pageSize,
        search: search || undefined,
        user_id: filterUserId || undefined,
        skill_id: filterSkillId || undefined,
        event_type: filterType || undefined
      });
      setEvents(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUserId, filterSkillId, filterType]);

  const fetchUsers = async () => {
    try {
      const response = await admin.listUsers({ page_size: 100 });
      setUsers(response.data.items);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await admin.listSkills({ page_size: 100 });
      setSkills(response.data.items);
    } catch (err) {
      console.error('Failed to load skills');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchUsers();
    fetchSkills();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      skill_id: '',
      user_id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'exercise',
      notes: '',
      duration_minutes: ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (event: AdminPracticeEvent) => {
    setEditingEvent(event);
    setFormData({
      skill_id: event.skill_id,
      user_id: event.user_id,
      date: event.date,
      type: event.type,
      notes: event.notes || '',
      duration_minutes: event.duration_minutes?.toString() || ''
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
        skill_id: formData.skill_id,
        user_id: formData.user_id,
        date: formData.date,
        type: formData.type,
        notes: formData.notes || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null
      };

      if (editingEvent) {
        await admin.updatePracticeEvent(editingEvent.id, data);
      } else {
        await admin.createPracticeEvent(data);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await admin.deletePracticeEvent(id);
      setDeleteConfirm(null);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete event');
    }
  };

  const filteredSkills = formData.user_id
    ? skills.filter(s => s.user_id === formData.user_id)
    : skills;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Practice Events</h1>
          <p className="text-txt-muted text-sm mt-1">{total} total events</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="card-elevated p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
              <input
                type="text"
                placeholder="Search notes..."
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
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Types</option>
            {PRACTICE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Skill</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Notes</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-txt-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">Loading...</td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">No events found</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-surface-300/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-txt-primary">{event.date}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{event.skill_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{event.user_email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="tag-fresh text-xs">{event.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">
                      {event.duration_minutes ? `${event.duration_minutes} min` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-muted max-w-xs truncate">{event.notes || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-accent-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === event.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(event.id)} className="p-1.5 rounded bg-decayed-base/10 text-decayed-base">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-surface-300 text-txt-muted">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(event.id)}
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
                {editingEvent ? 'Edit Practice Event' : 'Create Practice Event'}
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
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value, skill_id: '' })}
                  className="input-field w-full"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Skill</label>
                <select
                  required
                  value={formData.skill_id}
                  onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                  className="input-field w-full"
                  disabled={!formData.user_id}
                >
                  <option value="">Select skill</option>
                  {filteredSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field w-full"
                  >
                    {PRACTICE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="input-field w-full"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPracticeEvents;
