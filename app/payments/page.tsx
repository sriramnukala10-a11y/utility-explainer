'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { getPaymentStatusExplanation } from '@/lib/payment-gateway';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [newPayModal, setNewPayModal] = useState(false);
  const [initiating, setInitiating] = useState(false);

  // New payment form states
  const [selectedBillId, setSelectedBillId] = useState('bill_priya_elec_oct2026');
  const [payAmount, setPayAmount] = useState(1912.41);
  const [payMethod, setPayMethod] = useState('UPI');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/payments?status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user, statusFilter]);

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setInitiating(true);
    try {
      const res = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: selectedBillId,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPayModal(false);
        fetchPayments();
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-teal-500" />
            Payments & Transaction Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track pending, processing, and uncertain transactions. We never trust browser-reported success without cryptographic verification.
          </p>
        </div>

        <button
          onClick={() => setNewPayModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>Make a Utility Payment</span>
        </button>
      </div>

      {/* Payment Security Alert Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
          <strong>Strict Reconciliation Rule:</strong> If money was deducted from your bank but your transaction displays <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded font-semibold text-blue-800 dark:text-blue-200">UNKNOWN</code>, our ledger job actively reconciles with the bank clearing house. Never submit a duplicate charge while status verification is underway.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        {['ALL', 'PENDING', 'PROCESSING', 'SUCCESSFUL', 'UNKNOWN', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              statusFilter === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Transactions Table / Cards */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No payment records found</h3>
          <p className="text-xs text-slate-500 mt-1">Initiate a payment or change the status filter above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => {
            const exp = getPaymentStatusExplanation(p.status);

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {p.internalReference}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${exp.badgeClass}`}>
                      {p.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Via {p.paymentMethod} • {p.provider}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {exp.explanation}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>Initiated: {new Date(p.initiatedAt).toLocaleString()}</span>
                    {p.receiptNumber && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Receipt: <strong>{p.receiptNumber}</strong>
                      </span>
                    )}
                    {p.providerTransactionRef && (
                      <span className="font-mono text-slate-500">
                        Gateway Ref: {p.providerTransactionRef}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block md:text-right">Amount</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white block md:text-right">
                      ₹{p.amount.toFixed(2)}
                    </span>
                  </div>

                  <Link
                    href={`/payments/${p.id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>Inspect Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Make Payment Modal */}
      {newPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Initiate Utility Payment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Creates a server-side payment record in status PENDING. You can test various bank clearance outcomes via the sandbox simulator on the tracking screen.
            </p>

            <form onSubmit={handleInitiatePayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Utility Bill
                </label>
                <select
                  value={selectedBillId}
                  onChange={(e) => {
                    setSelectedBillId(e.target.value);
                    if (e.target.value.includes('watr')) setPayAmount(510.40);
                    else setPayAmount(1912.41);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bill_priya_elec_oct2026">Oct 2026 Electricity Bill (₹1,912.41 Due)</option>
                  <option value="bill_priya_watr_oct2026">Oct 2026 Water Bill (₹510.40 Due)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, BHIM)</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NET_BANKING">Net Banking (HDFC, SBI, ICICI)</option>
                  <option value="AUTO_DEBIT">NACH Mandate / Auto-Debit</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPayModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={initiating}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  {initiating ? 'Creating Session...' : 'Confirm & Initiate Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
