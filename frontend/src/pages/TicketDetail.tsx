import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tickets } from '../services/api';
import type { Ticket, TicketStatus } from '../types';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Send,
  User,
  Shield
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

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await tickets.get(id!);
      setTicket(res.data);
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!replyMessage.trim()) {
      setError('Message is required');
      return;
    }

    setSubmitting(true);
    try {
      await tickets.addReply(id!, { message: replyMessage.trim() });
      setReplyMessage('');
      fetchTicket();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-txt-muted mx-auto mb-4" />
        <p className="text-txt-muted">Ticket not found</p>
        <Link to="/support" className="text-accent-400 hover:underline mt-2 inline-block">
          Back to Support
        </Link>
      </div>
    );
  }

  const status = statusConfig[ticket.status];
  const isClosed = ticket.status === 'closed';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Link */}
      <Link
        to="/support"
        className="inline-flex items-center gap-2 text-txt-muted hover:text-accent-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Support
      </Link>

      {/* Ticket Header */}
      <div className="card-elevated p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-txt-primary mb-2">
              {ticket.subject}
            </h1>
            <p className="text-sm text-txt-muted">
              Created {formatDate(ticket.created_at)}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.icon}
            {status.label}
          </span>
        </div>

        {/* Original Message */}
        <div className="bg-surface-300 rounded-lg p-4 border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-txt-muted" />
            <span className="text-sm font-medium text-txt-secondary">You</span>
          </div>
          <p className="text-txt-primary whitespace-pre-wrap">{ticket.message}</p>
        </div>
      </div>

      {/* Replies */}
      {ticket.replies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-txt-primary">
            Replies ({ticket.replies.length})
          </h2>
          {ticket.replies.map((reply) => (
            <div
              key={reply.id}
              className={`card p-4 ${reply.is_admin_reply ? 'border-l-4 border-l-accent-400' : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {reply.is_admin_reply ? (
                  <>
                    <Shield className="w-4 h-4 text-accent-400" />
                    <span className="text-sm font-medium text-accent-400">Support Team</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-txt-muted" />
                    <span className="text-sm font-medium text-txt-secondary">You</span>
                  </>
                )}
                <span className="text-xs text-txt-muted ml-auto">
                  {formatDate(reply.created_at)}
                </span>
              </div>
              <p className="text-txt-primary whitespace-pre-wrap">{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {!isClosed ? (
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">
            Add Reply
          </h2>

          {error && (
            <div className="bg-decayed-base/10 border border-decayed-base/30 text-decayed-base px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitReply} className="space-y-4">
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
              className="input"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <XCircle className="w-8 h-8 text-txt-muted mx-auto mb-2" />
          <p className="text-txt-muted">This ticket is closed</p>
          <p className="text-sm text-txt-muted mt-1">
            Create a new ticket if you need further assistance
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
