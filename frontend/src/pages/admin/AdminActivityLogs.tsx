import React, { useState, useEffect, useCallback } from 'react';
import { adminLogs } from '../../services/api';
import type { AdminActivityLog, ActivityLogStats } from '../../types';
import Pagination from '../../components/admin/Pagination';
import {
  Activity,
  Trash2,
  X,
  Filter,
  Users,
  Eye,
  Clock,
  RefreshCw
} from 'lucide-react';

const AdminActivityLogs: React.FC = () => {
  // List state
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Stats state
  const [stats, setStats] = useState<ActivityLogStats | null>(null);

  // Filter state
  const [actionType, setActionType] = useState<string>('');
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [actionTypes, setActionTypes] = useState<string[]>([]);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Bulk delete modal
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState<string>('');
  const [bulkEndDate, setBulkEndDate] = useState<string>('');
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminLogs.list({
        page,
        page_size: pageSize,
        action_type: actionType || undefined,
        anonymous_only: anonymousOnly || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setLogs(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [page, actionType, anonymousOnly, startDate, endDate]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await adminLogs.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch action types
  const fetchActionTypes = useCallback(async () => {
    try {
      const response = await adminLogs.getActionTypes();
      setActionTypes(response.data);
    } catch (err) {
      console.error('Failed to load action types:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
    fetchActionTypes();
  }, [fetchStats, fetchActionTypes]);

  // Handle filter submit
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  // Handle clear filters
  const clearFilters = () => {
    setActionType('');
    setAnonymousOnly(false);
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await adminLogs.delete(id);
      setDeleteConfirm(null);
      fetchLogs();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete log');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!bulkStartDate && !bulkEndDate) {
      return;
    }

    try {
      setBulkDeleting(true);
      const response = await adminLogs.bulkDelete({
        start_date: bulkStartDate || undefined,
        end_date: bulkEndDate || undefined,
      });
      setShowBulkDeleteModal(false);
      setBulkStartDate('');
      setBulkEndDate('');
      fetchLogs();
      fetchStats();
      alert(`Deleted ${response.data.deleted_count} logs`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to bulk delete logs');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent-400" />
            Activity Logs
          </h1>
          <p className="text-txt-muted text-sm mt-1">Track user and visitor activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchLogs(); fetchStats(); }}
            className="btn-ghost flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowBulkDeleteModal(true)}
            className="btn-secondary flex items-center gap-2 text-decayed-base border-decayed-base/30 hover:bg-decayed-base/10"
          >
            <Trash2 className="w-4 h-4" />
            Bulk Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <p className="text-txt-muted text-xs">Total Logs</p>
                <p className="text-xl font-bold text-txt-primary">{stats.total_logs.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-fresh-base/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-fresh-base" />
              </div>
              <div>
                <p className="text-txt-muted text-xs">Unique Users</p>
                <p className="text-xl font-bold text-txt-primary">{stats.unique_users.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-base/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-warning-base" />
              </div>
              <div>
                <p className="text-txt-muted text-xs">Unique Sessions</p>
                <p className="text-xl font-bold text-txt-primary">{stats.unique_sessions.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-decayed-base/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-decayed-base" />
              </div>
              <div>
                <p className="text-txt-muted text-xs">Last 24h</p>
                <p className="text-xl font-bold text-txt-primary">{stats.logs_last_24h.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Lists */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="font-semibold text-txt-primary mb-3">Top Pages</h3>
            <div className="space-y-2">
              {stats.top_pages.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-txt-secondary text-sm truncate flex-1 mr-2">{item.page}</span>
                  <span className="text-txt-muted text-sm font-medium">{item.count}</span>
                </div>
              ))}
              {stats.top_pages.length === 0 && (
                <p className="text-txt-muted text-sm">No data yet</p>
              )}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-txt-primary mb-3">Top Actions</h3>
            <div className="space-y-2">
              {stats.top_actions.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-txt-secondary text-sm">{item.action}</span>
                  <span className="text-txt-muted text-sm font-medium">{item.count}</span>
                </div>
              ))}
              {stats.top_actions.length === 0 && (
                <p className="text-txt-muted text-sm">No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleFilter} className="card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-txt-secondary mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="input w-full"
            >
              <option value="">All actions</option>
              {actionTypes.map((at) => (
                <option key={at} value={at}>{at}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-txt-secondary mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-txt-secondary mb-1">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymousOnly}
                onChange={(e) => setAnonymousOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border-DEFAULT text-accent-500 focus:ring-accent-500"
              />
              <span className="text-sm text-txt-secondary">Anonymous only</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button type="button" onClick={clearFilters} className="btn-ghost">
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="card p-4 bg-decayed-base/10 border-decayed-base/30">
          <p className="text-decayed-base">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-300/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-txt-secondary uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-txt-secondary uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-txt-secondary uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-txt-secondary uppercase tracking-wider">Page</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-txt-secondary uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-txt-secondary uppercase tracking-wider">IP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-txt-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">No activity logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-300/30">
                    <td className="px-4 py-3 text-sm text-txt-secondary whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.user_email ? (
                        <span className="text-txt-primary">{log.user_email}</span>
                      ) : (
                        <span className="text-txt-muted italic">Anonymous</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-500/10 text-accent-400">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-secondary max-w-[200px] truncate">
                      {log.page || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-muted max-w-[150px] truncate">
                      {Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-muted">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirm === log.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-decayed-base hover:text-decayed-hover text-xs"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-txt-muted hover:text-txt-secondary text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(log.id)}
                          className="p-1 text-txt-muted hover:text-decayed-base transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
        />
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-txt-primary">Bulk Delete Logs</h2>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="p-1 text-txt-muted hover:text-txt-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-txt-muted mb-4">
              Delete all logs within a date range. This action cannot be undone.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-txt-secondary mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting || (!bulkStartDate && !bulkEndDate)}
                className="btn-primary bg-decayed-base hover:bg-decayed-hover disabled:opacity-50"
              >
                {bulkDeleting ? 'Deleting...' : 'Delete Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
