import React, { useState, useEffect, useCallback } from 'react';
import { admin } from '../../services/api';
import type { AdminUser } from '../../types';
import Pagination from '../../components/admin/Pagination';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ShieldOff,
  X,
  Check
} from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<boolean | undefined>(undefined);
  const pageSize = 20;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', is_admin: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await admin.listUsers({
        page,
        page_size: pageSize,
        search: search || undefined,
        is_admin: filterAdmin
      });
      setUsers(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', is_admin: false });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({ email: user.email, password: '', is_admin: user.is_admin });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      if (editingUser) {
        const updateData: any = { email: formData.email, is_admin: formData.is_admin };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await admin.updateUser(editingUser.id, updateData);
      } else {
        await admin.createUser(formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await admin.deleteUser(id);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const toggleAdmin = async (user: AdminUser) => {
    try {
      await admin.updateUser(user.id, { is_admin: !user.is_admin });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Users</h1>
          <p className="text-txt-muted text-sm mt-1">{total} total users</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
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
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
          <select
            value={filterAdmin === undefined ? '' : String(filterAdmin)}
            onChange={(e) => {
              setFilterAdmin(e.target.value === '' ? undefined : e.target.value === 'true');
              setPage(1);
            }}
            className="input-field"
          >
            <option value="">All Users</option>
            <option value="true">Admins Only</option>
            <option value="false">Non-Admins</option>
          </select>
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-decayed-base/10 text-decayed-base px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Admin</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Skills</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Learning</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Practice</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-txt-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-300/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-txt-primary">{user.email}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdmin(user)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          user.is_admin
                            ? 'bg-accent-400/10 text-accent-400'
                            : 'bg-surface-300 text-txt-muted'
                        }`}
                      >
                        {user.is_admin ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                        {user.is_admin ? 'Admin' : 'User'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{user.skills_count}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{user.learning_events_count}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{user.practice_events_count}</td>
                    <td className="px-4 py-3 text-sm text-txt-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-accent-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1.5 rounded bg-decayed-base/10 text-decayed-base hover:bg-decayed-base/20"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 rounded hover:bg-surface-300 text-txt-muted"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card-elevated w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-txt-primary">
                {editingUser ? 'Edit User' : 'Create User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-surface-300 text-txt-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-decayed-base/10 text-decayed-base px-4 py-2 rounded-lg mb-4 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">
                  Password {editingUser && <span className="text-txt-muted">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                  className="w-4 h-4 rounded border-border-DEFAULT text-accent-400 focus:ring-accent-400"
                />
                <label htmlFor="is_admin" className="text-sm text-txt-secondary">Admin privileges</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
