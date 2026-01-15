import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { admin } from '../../services/api';
import type { AdminTicket, AdminUser, TicketStatus } from '../../types';
import Pagination from '../../components/admin/Pagination';
import { Search, Eye, Trash2, X, Check, MessageSquare, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const statusConfig: Record<TicketStatus, { label: string; icon: React.ReactNode; color: string }> = {
  open: {
    label: 'Open',
    icon: <AlertCircle className="w-3 h-3" />,
    color: 'text-aging-base bg-aging-base/10'
  },
  in_progress: {
    label: 'In Progress',
    icon: <Clock className="w-3 h-3" />,
    color: 'text-accent-400 bg-accent-400/10'
  },
  resolved: {
    label: 'Resolved',
    icon: <CheckCircle className="w-3 h-3" />,
    color: 'text-fresh-base bg-fresh-base/10'
  },
  closed: {
    label: 'Closed',
    icon: <XCircle className="w-3 h-3" />,
    color: 'text-txt-muted bg-surface-300'
  }
};

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const pageSize = 20;

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await admin.listTickets({
        page,
        page_size: pageSize,
        search: search || undefined,
        user_id: filterUserId || undefined,
        status: filterStatus as TicketStatus || undefined
      });
      setTickets(response.data.items);
      setTotalPages(response.data.total_pages);
      setTotal(response.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterUserId, filterStatus]);

  const fetchUsers = async () => {
    try {
      const response = await admin.listUsers({ page_size: 100 });
      setUsers(response.data.items);
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleDelete = async (id: string) => {
    try {
      await admin.deleteTicket(id);
      setDeleteConfirm(null);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete ticket');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Support Tickets</h1>
          <p className="text-txt-muted text-sm mt-1">{total} total tickets</p>
        </div>
      </div>

      <div className="card-elevated p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted" />
              <input
                type="text"
                placeholder="Search by subject or message..."
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
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
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
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Replies</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-txt-secondary">Updated</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-txt-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">Loading...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-txt-muted">No tickets found</td>
                </tr>
              ) : (
                tickets.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  return (
                    <tr key={ticket.id} className="hover:bg-surface-300/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="max-w-[300px]">
                          <p className="text-sm text-txt-primary font-medium truncate">{ticket.subject}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-txt-secondary">{ticket.user_email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-txt-secondary">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.reply_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-txt-muted">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-txt-muted">
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/tickets/${ticket.id}`}
                            className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-accent-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {deleteConfirm === ticket.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(ticket.id)} className="p-1.5 rounded bg-decayed-base/10 text-decayed-base">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-surface-300 text-txt-muted">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(ticket.id)}
                              className="p-1.5 rounded hover:bg-surface-300 text-txt-muted hover:text-decayed-base transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={pageSize} />
      </div>
    </div>
  );
};

export default AdminTickets;
