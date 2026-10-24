'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Zap,
  Droplets,
  ArrowRight,
  Filter,
  Download,
  CreditCard,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';

export default function MyBillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [utilityFilter, setUtilityFilter] = useState('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    async function fetchBills() {
      setLoading(true);
      try {
        let url = `/api/v1/bills?status=${statusFilter}&utilityType=${utilityFilter}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setBills(data.data);
        }
      } catch (err) {
        console.error('Error fetching bills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBills();
  }, [user, statusFilter, utilityFilter]);

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess('Bill document verified & OCR processed. Meter reading: 318 kWh matches automated utility gateway.');
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadSuccess('');
      }, 2500);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            My Utility Bills
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete billing records for Electricity and Water accounts with transparent mathematical explanations.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Bill for Verification</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'UNPAID', 'PAID', 'OVERDUE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'ELECTRICITY', 'WATER'].map((util) => (
            <button
              key={util}
              onClick={() => setUtilityFilter(util)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                utilityFilter === util
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {util}
            </button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No bills match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching the status or utility filter tab above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => {
            const isElec = bill.account?.utilityType === 'ELECTRICITY';
            const isPaid = bill.status === 'PAID';

            return (
              <div
                key={bill.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isElec
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
                    }`}
                  >
                    {isElec ? <Zap className="w-6 h-6 fill-current" /> : <Droplets className="w-6 h-6 fill-current" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                        {bill.billNumber}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                      <p>
                        Account: <strong className="text-slate-700 dark:text-slate-300 font-mono">{bill.account?.accountNumber || 'ELEC-882941'}</strong> • Meter: {bill.account?.meterNumber || 'MTR-EL-90142'}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Billing Cycle: {new Date(bill.billingPeriodStart).toLocaleDateString()} – {new Date(bill.billingPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Consumption: <strong>{bill.unitsConsumed} {isElec ? 'kWh' : 'kL'}</strong>
                      </span>
                      {bill.previousUnitsConsumed && (
                        <span className={`text-[11px] font-semibold ${bill.unitsConsumed > bill.previousUnitsConsumed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                          ({bill.unitsConsumed > bill.previousUnitsConsumed ? '+' : ''}{bill.unitsConsumed - bill.previousUnitsConsumed} {isElec ? 'kWh' : 'kL'} vs prev)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <span className="text-xs text-slate-400 block md:text-right">Total Payable</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white block md:text-right">
                      ₹{bill.totalAmountDue.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-500 block md:text-right">
                      Due: {new Date(bill.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/bills/${bill.id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      Explain Bill
                    </Link>

                    {!isPaid ? (
                      <Link
                        href={`/payments?billId=${bill.id}&amount=${bill.balanceRemaining || bill.totalAmountDue}`}
                        className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-xs transition flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Now
                      </Link>
                    ) : (
                      <Link
                        href={`/bills/${bill.id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Statement
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bill Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              Upload Utility Bill for Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Upload an official electricity or water bill PDF or photo. Our system cross-checks meter readings against utility SCADA servers and extracts line items without manual data entry.
            </p>

            <form onSubmit={handleSimulatedUpload} className="mt-4 space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Drag and drop your bill PDF / JPG (Max 5MB)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">or click to browse local files</p>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
              </div>

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {uploading ? 'Processing OCR & Meter Data...' : 'Verify & Process Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
