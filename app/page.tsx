'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Droplets,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '@/components/auth-context';

export default function OverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/v1/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  const elecAccount = data?.accounts?.electricity;
  const watrAccount = data?.accounts?.water;
  const financial = data?.financialSummary;
  const alerts = data?.latestAlerts || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Demonstration Banner - Transparency requirement */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold">Demonstration Mode Notice:</strong> This interactive environment contains pre-seeded residential data for demonstration purposes (e.g., consumer <em>Priya Sharma</em> in Bengaluru). All tariff calculations, tier math, cryptographic webhooks, and status lifecycles are computed with strict mathematical precision.
        </div>
      </div>

      {/* Hero Welcome & Quick Stats */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-xs">
              Welcome back
            </span>
            <span className="text-xs text-blue-200">
              Account Holder: {user?.name || 'Priya Sharma'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Utilities That Explain Themselves
          </h1>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed max-w-2xl">
            See exactly why your bill changed, track the real bank status of uncertain transactions, and receive transparent restoration schedules during power or water outages.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/bills/bill_priya_elec_oct2026"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-blue-900 hover:bg-blue-50 shadow-md transition flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition" />
              Explain Oct Electricity Bill (+₹508)
            </Link>
            <Link
              href="/report"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white border border-blue-400/40 backdrop-blur-xs transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              Report Power or Water Outage
            </Link>
            <Link
              href="/payments"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-950/40 hover:bg-blue-950/60 text-white border border-blue-800 transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-teal-300" />
              Track Payments
            </Link>
          </div>
        </div>
      </div>

      {/* Financial & Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outstanding Total Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Due Balance
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Action Required
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                ₹{financial?.totalOutstandingBalance?.toFixed(2) || '2,422.81'}
              </span>
              <span className="text-xs text-slate-500">across 2 accounts</span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Due on: <strong>Nov 05, 2026</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              href="/bills"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Statement Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/payments"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-xs transition"
            >
              Pay Balance
            </Link>
          </div>
        </div>

        {/* Electricity Connection Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-blue-500" />
                Electricity Account
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {elecAccount?.accountNumber || 'ELEC-882941'}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">318 kWh</span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium ml-2">
                +32.5% vs Sept
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Meter: <code className="text-slate-700 dark:text-slate-300">{elecAccount?.meterNumber || 'MTR-EL-90142'}</code> (Active)
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
              Oct Bill: ₹1,912.41 (Unpaid)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/bills/bill_priya_elec_oct2026"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between"
            >
              <span>Why did this bill increase?</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Water Connection Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 fill-teal-500" />
                Water Account
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {watrAccount?.accountNumber || 'WATR-441029'}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">26 kL</span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium ml-2">
                +44% vs Sept
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Meter: <code className="text-slate-700 dark:text-slate-300">{watrAccount?.meterNumber || 'MTR-WT-31890'}</code> (Active)
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
              Oct Bill: ₹510.40 (Unpaid)
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/bills/bill_priya_watr_oct2026"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center justify-between"
            >
              <span>Water Volumetric Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Consumption Comparison Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              6-Month Consumption Comparison
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Electricity usage measured in kWh; Water volume measured in kL (kiloliters).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
              Electricity (kWh)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded bg-teal-400 inline-block" />
              Water (kL)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.consumptionHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="electricity" name="Electricity (kWh)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="water" name="Water (kL)" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Active Tickets & Verified Service Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Complaints & Tickets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Active Complaint Tickets ({data?.activeTicketsCount || 0})
              </h2>
              <Link href="/tickets" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                View all tickets
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      UTIL-2026-000101
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      In Progress
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                    Voltage drops below 160V between 18:00 and 21:00.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assigned: K. Murthy (Linesman) • Tap changer adjustment
                  </p>
                </div>
                <Link
                  href="/tickets/tkt_01"
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shrink-0"
                >
                  Track
                </Link>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      UTIL-2026-000102
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Acknowledged
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                    Water leakage from pipeline joint near gate 2.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Water supply isolated • Excavation crew dispatched
                  </p>
                </div>
                <Link
                  href="/tickets/tkt_02"
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shrink-0"
                >
                  Track
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/report"
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              File a New Service or Outage Report
            </Link>
          </div>
        </div>

        {/* Verified Service Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                Verified Service Notices ({alerts.length})
              </h2>
              <span className="text-[11px] text-slate-400">Operations Control</span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Source: {alert.verifiedSource}</span>
                    {alert.estimatedRestoration && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Restoration: {new Date(alert.estimatedRestoration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/notifications"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between"
            >
              <span>View all notifications & SMS audit logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
