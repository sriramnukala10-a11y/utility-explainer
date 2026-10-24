'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  ArrowLeft,
  Clock,
  Printer,
  Copy,
  Check,
  Send,
  RotateCcw,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { getStatusBadgeInfo, VALID_CATEGORIES } from '@/lib/ticket-manager';

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [reopenNote, setReopenNote] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/v1/tickets/${id}`);
      const json = await res.json();
      if (json.success) {
        setTicket(json.data);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/v1/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: commentText,
          isInternal: isInternalComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCommentText('');
        fetchTicket();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleReopenTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setReopening(true);
    try {
      const res = await fetch(`/api/v1/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          note: reopenNote || 'Customer reported the problem is still recurring.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReopenBox(false);
        setReopenNote('');
        fetchTicket();
      }
    } catch (err) {
      console.error('Error reopening ticket:', err);
    } finally {
      setReopening(false);
    }
  };

  const handleCopyTicketNum = () => {
    if (ticket?.ticketNumber) {
      navigator.clipboard.writeText(ticket.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">No ticket matches the identifier &ldquo;{id}&rdquo;.</p>
        <Link href="/tickets" className="mt-4 inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white">
          Back to Tickets
        </Link>
      </div>
    );
  }

  const badge = getStatusBadgeInfo(ticket.status);
  const categoryInfo = VALID_CATEGORIES[ticket.category as keyof typeof VALID_CATEGORIES];
  const isStaff = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/tickets"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket Card</span>
          </button>
        </div>
      </div>

      {/* Ticket Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                {ticket.ticketNumber}
              </span>
              <button
                onClick={handleCopyTicketNum}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 no-print"
                title="Copy Ticket Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Priority: {ticket.priority}
              </span>
            </div>

            <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {categoryInfo ? categoryInfo.label : ticket.category}
            </h1>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
              {ticket.description}
            </p>
          </div>

          <div className="sm:text-right text-xs text-slate-500 space-y-1">
            <p>Reported by: <strong>{ticket.user?.name || 'Customer'}</strong></p>
            <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
            <p>Last Update: {new Date(ticket.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Location & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Premises Location</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block">
              {ticket.serviceAddress}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Assigned Dispatch Squad</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 mt-1 block">
              {ticket.assignedTo ? `${ticket.assignedTo.name} (Field Technician)` : 'Under Operations Triage'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Notification Channel</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block">
              {ticket.contactPreference} ({ticket.contactPhone || ticket.contactEmail})
            </span>
          </div>
        </div>

        {/* Reopen Capability for Resolved Tickets */}
        {ticket.status === 'RESOLVED' && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs no-print">
            <div className="flex items-center justify-between">
              <span className="text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                This issue was marked resolved. Has the problem persisted?
              </span>
              <button
                onClick={() => setShowReopenBox(!showReopenBox)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen Ticket</span>
              </button>
            </div>

            {showReopenBox && (
              <form onSubmit={handleReopenTicket} className="mt-3 space-y-2 border-t border-emerald-200 dark:border-emerald-900 pt-3">
                <textarea
                  rows={2}
                  value={reopenNote}
                  onChange={(e) => setReopenNote(e.target.value)}
                  placeholder="Explain why you are reopening this ticket (e.g. voltage dropped again after 8 PM)..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  required
                />
                <button
                  type="submit"
                  disabled={reopening}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                >
                  {reopening ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Status History & Dispatch Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-500" />
          Live Field Status Timeline
        </h2>

        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
          {ticket.statusEvents?.map((evt: any) => (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {evt.fromStatus} → {evt.toStatus}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(evt.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {evt.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments & Follow-Up Discussion */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 no-print">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-500" />
          Follow-Up Notes & Customer Updates ({ticket.comments?.length || 0})
        </h2>

        <div className="space-y-3">
          {ticket.comments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No notes added yet.</p>
          ) : (
            ticket.comments?.map((c: any) => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border text-xs space-y-1 ${
                  c.isInternal
                    ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {c.authorName} ({c.authorRole})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {c.isInternal && (
                  <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 block">
                    Staff Internal Note (Hidden from public)
                  </span>
                )}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  {c.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handlePostComment} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
            Add Follow-Up Information or Reply
          </label>
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Provide additional details, premises access instructions, or updates..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex items-center justify-between">
            {isStaff ? (
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  className="rounded border-slate-400 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                />
                <span>Internal staff note (do not expose to customer)</span>
              </label>
            ) : <div />}

            <button
              type="submit"
              disabled={postingComment}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{postingComment ? 'Posting...' : 'Post Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
