import React, { useState, useEffect, useCallback } from 'react';
import { admin } from '../../services/api';
import type { AdminSkill, AdminUser, AdminCategory } from '../../types';
import Pagination from '../../components/admin/Pagination';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Archive,
  RotateCcw
} from 'lucide-react';

const AdminSkills: React.FC = () => {
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const pageSize = 20;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AdminSkill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
    category_id: '',
    decay_rate: 0.02,
    target_freshness: '',
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await admin.listSkills({
        page,
        page_size: pageSize,
        search: search || undefined,
        user_id: filterUserId || undefined,
        category_id: filterCategoryId || undefined,
        include_archived: includeArchived
      });
      setSkills(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUserId, filterCategoryId, includeArchived]);

  const fetchUsers = async () => {
    try {
      const response = await admin.listUsers({ page_size: 100 });
      setUsers(response.data.items);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await admin.listCategories({ page_size: 100 });
      setCategories(response.data.items);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSkills();
  };

  const getFreshnessColor = (freshness: number | null) => {
    if (freshness === null) return 'text-txt-muted';
    if (freshness > 70) return 'text-fresh-base';
    if (freshness > 40) return 'text-aging-base';
    return 'text-decayed-base';
  };

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      user_id: '',
      category_id: '',
      decay_rate: 0.02,
      target_freshness: '',
      notes: ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (skill: AdminSkill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      user_id: skill.user_id,
      category_id: skill.category_id || '',
      decay_rate: skill.decay_rate,
      target_freshness: skill.target_freshness?.toString() || '',
      notes: skill.notes || ''
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
        name: formData.name,
        user_id: formData.user_id,
        decay_rate: formData.decay_rate,
        notes: formData.notes || null
      };
      if (formData.category_id) data.category_id = formData.category_id;
      if (formData.target_freshness) data.target_freshness = parseFloat(formData.target_freshness);

      if (editingSkill) {
        await admin.updateSkill(editingSkill.id, data);
      } else {
        await admin.createSkill(data);
      }
      setShowModal(false);
      fetchSkills();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await admin.deleteSkill(id);
      setDeleteConfirm(null);
      fetchSkills();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete skill');
    }
  };

  const toggleArchive = async (skill: AdminSkill) => {
    try {
      await admin.updateSkill(skill.id, {
        archived_at: skill.archived_at ? undefined : new Date().toISOString()
      });
      fetchSkills();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update skill');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Skills</h1>
          <p className="text-txt-muted text-sm mt-1">{total} total skills</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Filters */}
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
            value={filterCategoryId}
            onChange={(e) => { setFilterCategoryId(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-txt-secondary">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => { setIncludeArchived(e.target.checked); setPage(1); }}
              className="w-4 h-4 rounded border-border-DEFAULT"
            />
            Include archived
          </label>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
      </div>

      {error && (
        <div className="bg-decayed-base/10 text-decayed-base px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Freshness</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Events</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-txt-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">Loading...</td>
                </tr>
              ) : skills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">No skills found</td>
                </tr>
              ) : (
                skills.map((skill) => (
                  <tr key={skill.id} className={`hover:bg-surface-300/50 transition-colors ${skill.archived_at ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-sm text-txt-primary font-medium">{skill.name}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{skill.user_email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{skill.category_name || '-'}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${getFreshnessColor(skill.freshness)}`}>
                      {skill.freshness !== null ? `${skill.freshness.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">
                      L: {skill.learning_events_count} / P: {skill.practice_events_count}
                    </td>
                    <td className="px-4 py-3">
                      {skill.archived_at ? (
                        <span className="tag-decayed text-xs">Archived</span>
                      ) : (
                        <span className="tag-fresh text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(skill)}
                          className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-accent-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleArchive(skill)}
                          className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-aging-base transition-colors"
                          title={skill.archived_at ? 'Restore' : 'Archive'}
                        >
                          {skill.archived_at ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                        {deleteConfirm === skill.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(skill.id)} className="p-1.5 rounded bg-decayed-base/10 text-decayed-base">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-surface-300 text-txt-muted">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(skill.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-elevated w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-txt-primary">
                {editingSkill ? 'Edit Skill' : 'Create Skill'}
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
                <label className="block text-sm font-medium text-txt-secondary mb-1">Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                />
              </div>

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
                <label className="block text-sm font-medium text-txt-secondary mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">No category</option>
                  {categories.filter(c => c.user_id === formData.user_id).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1">Decay Rate</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    max="0.1"
                    value={formData.decay_rate}
                    onChange={(e) => setFormData({ ...formData, decay_rate: parseFloat(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-secondary mb-1">Target Freshness</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.target_freshness}
                    onChange={(e) => setFormData({ ...formData, target_freshness: e.target.value })}
                    className="input-field w-full"
                    placeholder="Optional"
                  />
                </div>
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
                  {saving ? 'Saving...' : editingSkill ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkills;
