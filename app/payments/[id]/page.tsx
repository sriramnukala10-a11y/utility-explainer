'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Printer,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Terminal,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchPayment = async () => {
    try {
      const res = await fetch(`/api/v1/payments/${id}`);
      const json = await res.json();
      if (json.success) {
        setPayment(json.data);
      }
    } catch (err) {
      console.error('Error fetching payment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const handleCheckStatus = async () => {
    setRefreshing(true);
    setStatusMessage('');
    try {
      const res = await fetch(`/api/v1/payments/${id}/check-status`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        fetchPayment();
      }
    } catch (err) {
      console.error('Status check error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSimulate = async (outcome: string) => {
    setSimulating(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/v1/payments/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: id, outcome }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        fetchPayment();
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleCopyRef = () => {
    if (payment?.internalReference) {
      navigator.clipboard.writeText(payment.internalReference);
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

  if (!payment) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Transaction Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">No payment record found with reference &ldquo;{id}&rdquo;.</p>
        <Link href="/payments" className="mt-4 inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white">
          Back to Payments
        </Link>
      </div>
    );
  }

  const exp = payment.statusExplanation;
  const isSuccess = payment.status === 'SUCCESSFUL';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/payments"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payments</span>
        </Link>

        <div className="flex items-center gap-2">
          {isSuccess && (
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Receipt</span>
            </button>
          )}

          <Link
            href="/support"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact Payment Support</span>
          </Link>
        </div>
      </div>

      {/* Main Status & Receipt Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                {payment.internalReference}
              </span>
              <button
                onClick={handleCopyRef}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 no-print"
                title="Copy Reference"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${exp.badgeClass}`}>
                {payment.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Method: <strong>{payment.paymentMethod}</strong> • Provider:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{payment.provider}</span>
            </p>
            {payment.receiptNumber && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Official Receipt Number: <strong className="font-mono">{payment.receiptNumber}</strong>
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block">Total Transaction Amount</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white block mt-0.5">
              ₹{payment.amount.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              Currency: {payment.currency}
            </span>
          </div>
        </div>

        {/* Status Meaning & Plain-Language Explanation */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            What This Status Means:
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {exp.explanation}
          </p>

          {/* Action buttons based on status */}
          <div className="mt-4 flex flex-wrap items-center gap-3 no-print">
            {exp.canRetryCheck && (
              <button
                onClick={handleCheckStatus}
                disabled={refreshing}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition flex items-center gap-2 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Check Status Again (Safe Re-check)</span>
              </button>
            )}

            {exp.supportActionRecommended && (
              <Link
                href="/support"
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition flex items-center gap-2 shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Open Reconciliation Dispute Ticket</span>
              </Link>
            )}
          </div>

          {statusMessage && (
            <div className="mt-3 p-2.5 bg-blue-100/60 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Audit Timeline of Status Changes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-blue-500" />
          Verified State Transition Timeline & Audit Ledger
        </h2>

        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
          {payment.statusEvents?.map((evt: any) => (
            <div key={evt.id} className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Transition: {evt.fromStatus} → {evt.toStatus}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    By {evt.triggeredBy}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {evt.reason}
                </p>
                <span className="text-[11px] text-slate-400 block">
                  {new Date(evt.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Sandbox Simulator Controls - Clearly Labeled */}
      <div className="p-6 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 rounded-2xl space-y-3 no-print">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Development Mode • Payment Provider Sandbox Simulator
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          In development or sandbox mode, use these actions to test state transitions and cryptographic webhook verification without moving real money.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => handleSimulate('SUCCESS')}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            Simulate Gateway Capture (Success)
          </button>
          <button
            onClick={() => handleSimulate('FAIL')}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition"
          >
            Simulate Bank Decline (Failure)
          </button>
          <button
            onClick={() => handleSimulate('TIMEOUT_UNKNOWN')}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition"
          >
            Simulate Bank Timeout (Unknown Outcome)
          </button>
          <button
            onClick={() => handleSimulate('FIRE_WEBHOOK')}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 disabled:opacity-50 transition"
          >
            Dispatch HMAC-SHA256 Webhook
          </button>
        </div>
      </div>
    </div>
  );
}
