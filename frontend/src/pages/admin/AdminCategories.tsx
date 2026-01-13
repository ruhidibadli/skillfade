import React, { useState, useEffect, useCallback } from 'react';
import { admin } from '../../services/api';
import type { AdminCategory, AdminUser } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const pageSize = 20;

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', user_id: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await admin.listCategories({
        page,
        page_size: pageSize,
        search: search || undefined,
        user_id: filterUserId || undefined
      });
      setCategories(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUserId]);

  const fetchUsers = async () => {
    try {
      const response = await admin.listUsers({ page_size: 100 });
      setUsers(response.data.items);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCategories();
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', user_id: '' });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({ name: category.name, user_id: category.user_id });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      if (editingCategory) {
        await admin.updateCategory(editingCategory.id, formData);
      } else {
        await admin.createCategory(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await admin.deleteCategory(id);
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Categories</h1>
          <p className="text-txt-muted text-sm mt-1">{total} total categories</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Category
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
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Skills</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-txt-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-txt-muted">Loading...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-txt-muted">No categories found</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-300/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-txt-primary font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{category.user_email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{category.skills_count}</td>
                    <td className="px-4 py-3 text-sm text-txt-muted">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-accent-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === category.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(category.id)} className="p-1.5 rounded bg-decayed-base/10 text-decayed-base">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-surface-300 text-txt-muted">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(category.id)}
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
          <div className="card-elevated w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-txt-primary">
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  maxLength={50}
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

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
