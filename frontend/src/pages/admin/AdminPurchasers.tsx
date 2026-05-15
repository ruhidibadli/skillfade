import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2, AlertCircle, Filter } from 'lucide-react';
import { admin } from '../../services/api';
import Pagination from '../../components/admin/Pagination';
import type { AdminSubscription } from '../../types';

type StatusFilter = '' | 'active' | 'pending' | 'refunded' | 'failed' | 'revoked';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
  { value: 'revoked', label: 'Revoked' },
];

const statusClass = (s: string): string => {
  switch (s) {
    case 'active':   return 'text-fresh-base bg-fresh-base/10';
    case 'pending':  return 'text-aging-base bg-aging-base/10';
    case 'refunded': return 'text-txt-muted bg-surface-300';
    case 'failed':   return 'text-decayed-base bg-decayed-base/10';
    case 'revoked':  return 'text-decayed-base bg-decayed-base/10';
    default:         return 'text-txt-muted bg-surface-300';
  }
};

const planClass = (p: string): string => {
  switch (p) {
    case 'lifetime':      return 'text-accent-400 bg-accent-400/10';
    case 'grandfathered': return 'text-secondary-400 bg-secondary-400/10';
    case 'free':          return 'text-txt-muted bg-surface-300';
    default:               return 'text-txt-muted bg-surface-300';
  }
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
};

const AdminPurchasers: React.FC = () => {
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const pageSize = 20;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await admin.listSubscriptions({
        page,
        page_size: pageSize,
        status: statusFilter || undefined,
      });
      setItems(res.data.items);
      setTotalPages(res.data.total_pages);
      setTotal(res.data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load purchasers');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const onStatusChange = (s: StatusFilter) => {
    setStatusFilter(s);
    setPage(1);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent-400/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Purchasers</h1>
          <p className="text-sm text-txt-muted">Read-only view of subscription rows. Refunds will live here when the Epoint reverse flow ships.</p>
        </div>
      </div>

      <div className="card-elevated p-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-txt-muted" />
          <span className="text-sm text-txt-muted mr-1">Status:</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-accent-400 text-surface-50'
                  : 'bg-surface-300 text-txt-secondary hover:text-txt-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-decayed-base bg-decayed-base/10 rounded-lg p-3 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card-elevated overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 text-txt-muted p-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="text-txt-muted p-6 text-sm">No subscriptions match this filter.</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-txt-muted">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Purchased</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Txn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-surface-300/40">
                  <td className="px-4 py-3 text-txt-primary">{s.user_email ?? <span className="text-txt-muted">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${planClass(s.plan)}`}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusClass(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-txt-secondary">
                    {s.amount != null ? `${s.amount} ${s.currency}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-txt-muted text-xs">{s.provider}</td>
                  <td className="px-4 py-3 text-txt-muted text-xs">{formatDate(s.purchased_at)}</td>
                  <td className="px-4 py-3 text-txt-muted font-mono text-xs">{s.order_id ?? '—'}</td>
                  <td className="px-4 py-3 text-txt-muted font-mono text-xs">{s.epoint_transaction ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default AdminPurchasers;
