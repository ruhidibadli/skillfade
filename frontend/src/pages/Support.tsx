import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tickets } from '../services/api';
import type { TicketListItem, TicketStatus } from '../types';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  ChevronRight,
  X
} from 'lucide-react';

const statusConfig: Record<TicketStatus, { label: string; icon: React.ReactNode; color: string }> = {
  open: {
    label: 'Open',
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-aging-base bg-aging-base/10'
  },
  in_progress: {
    label: 'In Progress',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-accent-400 bg-accent-400/10'
  },
  resolved: {
    label: 'Resolved',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-fresh-base bg-fresh-base/10'
  },
  closed: {
    label: 'Closed',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-txt-muted bg-surface-300'
  }
};

const Support: React.FC = () => {
  const [ticketList, setTicketList] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await tickets.list();
      setTicketList(res.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-display-md text-txt-primary mb-2">Support</h1>
          <p className="text-txt-secondary">Get help with your account or report issues</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Tickets List */}
      <div className="card-elevated p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent-400/10">
            <MessageSquare className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-txt-primary">Your Tickets</h2>
            <p className="text-sm text-txt-muted mt-1">
              View and manage your support requests
            </p>
          </div>
        </div>

        {ticketList.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-txt-muted mx-auto mb-4" />
            <p className="text-txt-muted">No tickets yet</p>
            <p className="text-sm text-txt-muted mt-1">
              Create a new ticket if you need help
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ticketList.map((ticket) => {
              const status = statusConfig[ticket.status];
              return (
                <Link
                  key={ticket.id}
                  to={`/support/${ticket.id}`}
                  className="flex items-center justify-between p-4 bg-surface-300 rounded-lg border border-border-subtle hover:border-accent-400/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-txt-primary truncate">
                        {ticket.subject}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-txt-muted">
                      <span>{formatDate(ticket.created_at)}</span>
                      <span>{ticket.reply_count} {ticket.reply_count === 1 ? 'reply' : 'replies'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-txt-muted group-hover:text-accent-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <CreateTicketModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
};

const CreateTicketModal: React.FC<{
  onClose: () => void;
  onCreated: () => void;
}> = ({ onClose, onCreated }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setSubmitting(true);
    try {
      await tickets.create({ subject: subject.trim(), message: message.trim() });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-content p-6 animate-scale-in max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-txt-primary">
            Create Support Ticket
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
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="input"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">
              Message
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={6}
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
