'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Clock,
  Radio,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';

export default function AdminDashboardPage() {
  const { user, switchDemoUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Alert State
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertUtility, setAlertUtility] = useState<'ELECTRICITY' | 'WATER' | 'ALL'>('ALL');
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFO'>('WARNING');
  const [alertAreas, setAlertAreas] = useState('');
  const [alertSource, setAlertSource] = useState('Central Operations Control');
  const [publishingAlert, setPublishingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState('');

  // Ticket Triage Action States
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [assigneeId, setAssigneeId] = useState('usr_tech_01');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/overview');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Admin overview fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, [user]);

  const handlePublishAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishingAlert(true);
    setAlertSuccess('');
    try {
      const res = await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: alertTitle,
          message: alertMessage,
          utilityType: alertUtility,
          severity: alertSeverity,
          affectedAreas: alertAreas,
          verifiedSource: alertSource,
        }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setAlertSuccess('Official service notice broadcasted to customer portal and notification ledger.');
        setAlertTitle('');
        setAlertMessage('');
        setAlertAreas('');
        fetchAdminOverview();
      }
    } catch (err) {
      console.error('Publish alert error:', err);
    } finally {
      setPublishingAlert(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string) => {
    if (!statusNote.trim()) return;
    setUpdatingTicket(true);
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          note: statusNote,
          assignedToId: assigneeId,
        }),
      });
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setSelectedTicketId(null);
        setStatusNote('');
        fetchAdminOverview();
      }
    } catch (err) {
      console.error('Ticket update error:', err);
    } finally {
      setUpdatingTicket(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrative Privileges Required
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          The administrative operations console is restricted by server-side RBAC. You are currently viewing as customer <strong>{user?.name || 'Priya Sharma'}</strong>.
        </p>
        <div className="pt-2">
          <button
            onClick={() => switchDemoUser('ADMIN')}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-500 shadow-sm transition"
          >
            Switch to Chief Administrator (Admin Role)
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const m = data?.metrics;
  const reconciliationQueue = data?.reconciliationQueue || [];
  const recentTickets = data?.recentTickets || [];
  const auditLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Administrative RBAC Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Operations Command & Reconciliation Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time database analytics, payment discrepancy reconciliation, complaint triage, and emergency alert broadcasting.
          </p>
        </div>

        <button
          onClick={fetchAdminOverview}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-purple-500" />
          <span>Refresh DB Metrics</span>
        </button>
      </div>

      {/* KPI Cards Calculated from Database */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Customers</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block">
            {m?.totalCustomers || 0} Registered
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active consumer utility accounts</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Outstanding Balance</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block">
            ₹{m?.totalOutstanding?.toFixed(2) || '0.00'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Total across {m?.totalBills || 0} billing cycles</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Open Service Tickets</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block">
            {m?.openTickets || 0} Open
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Requiring field squad action</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Reconciliation Queue</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2 block">
            {m?.uncertainPaymentsCount || 0} Inconclusive
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Unknown banking state transactions</span>
        </div>
      </div>

      {/* Reconciliation Queue Panel - Critical Requirement */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-500" />
              Banking Discrepancy & Reconciliation Review Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transactions where the issuing bank clearance timed out or was flagged for dual-entry audit.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
            {reconciliationQueue.length} records
          </span>
        </div>

        {reconciliationQueue.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">
            No payments currently flagged for manual reconciliation. All ledger entries are matched.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Internal Ref</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Gateway Error / Audit Reason</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reconciliationQueue.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {p.internalReference}
                    </td>
                    <td className="py-3 px-3">{p.user?.name || 'Customer'}</td>
                    <td className="py-3 px-3 font-bold font-mono">₹{p.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                      {p.failureReason || 'Awaiting acquiring bank confirmation'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/payments/${p.id}`}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition"
                      >
                        Inspect Ledger
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid: Ticket Triage & Broadcast Service Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ticket Assignment & Status Management */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Service Ticket Triage & Field Assignment
            </h2>
            <Link href="/tickets" className="text-xs text-blue-600 hover:underline">
              View All Tickets
            </Link>
          </div>

          <div className="space-y-3">
            {recentTickets.map((t: any) => {
              const isSelected = selectedTicketId === t.id;
              return (
                <div
                  key={t.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {t.ticketNumber} ({t.category})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {t.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 line-clamp-1">{t.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Location: {t.serviceAddress} • Assigned: {t.assignedTo?.name || 'Unassigned'}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setSelectedTicketId(isSelected ? null : t.id)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isSelected ? 'Close Controls' : 'Change Status / Assign Squad'}
                    </button>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    >
                      <span>Details</span>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {isSelected && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">
                            New Administrative Status
                          </label>
                          <select
                            value={targetStatus}
                            onChange={(e) => setTargetStatus(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="WAITING_CUSTOMER">WAITING_CUSTOMER</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-400 block mb-1">
                            Assign Technician
                          </label>
                          <select
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="usr_tech_01">K. Murthy (Sr. Linesman)</option>
                            <option value="usr_admin_01">Chief Utility Administrator</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">
                          Official Status Update Note *
                        </label>
                        <input
                          type="text"
                          value={statusNote}
                          onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="e.g. Assigned squad to Indiranagar feeder repair..."
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleUpdateTicketStatus(t.id)}
                          disabled={updatingTicket}
                          className="px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                          {updatingTicket ? 'Saving...' : 'Apply Transition'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Public Service Announcement Broadcaster */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              Broadcast Official Service Notice
            </h2>
            <span className="text-[11px] text-slate-400">Operations Control</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Broadcast emergency maintenance, feeder shutdowns, or water pressure alerts. Per system rules, alerts are displayed only when backed by an official verified source.
          </p>

          {alertSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{alertSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePublishAlert} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g. Scheduled 66kV Transformer Maintenance"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Utility Type
                </label>
                <select
                  value={alertUtility}
                  onChange={(e) => setAlertUtility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="WATER">Water</option>
                  <option value="ALL">All Utilities</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Severity Level
                </label>
                <select
                  value={alertSeverity}
                  onChange={(e) => setAlertSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="WARNING">WARNING (High Impact)</option>
                  <option value="CRITICAL">CRITICAL (Emergency)</option>
                  <option value="ADVISORY">ADVISORY (Pre-cautionary)</option>
                  <option value="INFO">INFO (Informational)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Affected Areas / Sub-divisions *
              </label>
              <input
                type="text"
                value={alertAreas}
                onChange={(e) => setAlertAreas(e.target.value)}
                placeholder="e.g. Indiranagar Stage 1 & 2, Defence Colony"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Notice Content & Expected Restoration *
              </label>
              <textarea
                rows={3}
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Explain the reason for shutdown, safety precautions, and expected restoration window..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Verified Issuing Authority *
              </label>
              <input
                type="text"
                value={alertSource}
                onChange={(e) => setAlertSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={publishingAlert}
                className="px-4 py-2 font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition flex items-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{publishingAlert ? 'Broadcasting...' : 'Publish Official Notice'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Audit Log Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Security Audit Trail & Administrative Event Ledger
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Entity</th>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {auditLogs.map((log: any) => (
                <tr key={log.id}>
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 text-blue-600 dark:text-blue-400">
                    {log.entityType}
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    {log.userEmail || log.userId || 'SYSTEM'}
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                    {log.detailsJson || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
