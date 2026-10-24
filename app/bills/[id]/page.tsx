'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  FileText,
  Zap,
  Droplets,
  ArrowLeft,
  Printer,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function BillExplanationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    TIER_SLAB: true,
    FIXED: true,
    SURCHARGE: true,
    TAX_DUTY: true,
  });

  useEffect(() => {
    async function fetchExplanation() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/bills/${id}/explanation`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Error fetching explanation:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchExplanation();
  }, [id]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!data?.bill) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Bill Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested utility statement does not exist or has been archived.</p>
        <Link href="/bills" className="mt-4 inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white">
          Return to Bills
        </Link>
      </div>
    );
  }

  const { bill, previousBill, comparison } = data;
  const isElec = bill.account?.utilityType === 'ELECTRICITY';
  const currency = comparison?.currency || '₹';

  // Group line items by category
  const groupedLineItems = bill.lineItems?.reduce((acc: any, item: any) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar Navigation & Print Action */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/bills"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Bills</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Bill Breakdown</span>
          </button>

          {bill.status !== 'PAID' && (
            <Link
              href={`/payments?billId=${bill.id}&amount=${bill.balanceRemaining || bill.totalAmountDue}`}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-xs transition flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Bill ({currency}{bill.totalAmountDue.toFixed(2)})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Bill Overview Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isElec
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
              }`}
            >
              {isElec ? <Zap className="w-7 h-7 fill-current" /> : <Droplets className="w-7 h-7 fill-current" />}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {bill.billNumber}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    bill.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {bill.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Consumer: <strong>{bill.user?.name || 'Priya Sharma'}</strong> • Account:{' '}
                <span className="font-mono text-slate-700 dark:text-slate-300">{bill.account?.accountNumber}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Service Address: {bill.account?.serviceAddress?.streetAddress || 'Indiranagar, Bengaluru'}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount Payable</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white block mt-0.5">
              {currency}{bill.totalAmountDue.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              Due Date: <strong>{new Date(bill.dueDate).toLocaleDateString()}</strong>
            </span>
          </div>
        </div>

        {/* Meter & Billing Period Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Billing Period</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
              {new Date(bill.billingPeriodStart).toLocaleDateString()} – {new Date(bill.billingPeriodEnd).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Meter Number</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
              {bill.account?.meterNumber}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Units Consumed</span>
            <span className="font-bold text-slate-900 dark:text-white mt-1 block text-sm">
              {bill.unitsConsumed} {isElec ? 'kWh' : 'kL'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <span className="text-slate-400 block">Tariff Scheme</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 mt-1 block">
              {isElec ? 'LT-2 Domestic Progressive' : 'BWSSB Residential'}
            </span>
          </div>
        </div>
      </div>

      {/* SMART EXPLANATION ENGINE SECTION */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden card-print">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1.5 rounded-lg bg-blue-500/30 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <h2 className="text-lg font-bold tracking-tight">
              Deterministic Bill Variance Explanation
            </h2>
          </div>

          {/* Plain Language Dynamic Mathematical Narrative */}
          <div className="p-4 bg-white/10 dark:bg-black/30 rounded-xl border border-white/10 backdrop-blur-sm">
            <p className="text-sm text-slate-100 leading-relaxed font-medium">
              {comparison?.plainLanguageSummary}
            </p>
          </div>

          {/* Contributors Waterfall / Key Drivers */}
          {comparison?.largestContributors && comparison.largestContributors.length > 0 && (
            <div className="mt-6 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200 block">
                Largest Verified Contributors to Difference:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {comparison.largestContributors.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-blue-300">
                        <span>{c.category}</span>
                        <span className={c.difference > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {c.difference > 0 ? '+' : ''}{currency}{Math.abs(c.difference).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1.5 leading-normal">
                        {c.explanation}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Impact Share</span>
                      <span className="font-bold text-white">{c.percentageOfChange}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table vs Previous Billing Period */}
      {comparison?.hasPreviousBill && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            Period-over-Period Variance Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 rounded-l-lg">Metric / Charge Category</th>
                  <th className="py-2.5 px-4">Previous ({previousBill?.billNumber})</th>
                  <th className="py-2.5 px-4">Current ({bill.billNumber})</th>
                  <th className="py-2.5 px-4 rounded-r-lg text-right">Net Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">Consumption Volume</td>
                  <td className="py-3 px-4">{previousBill?.unitsConsumed} {isElec ? 'kWh' : 'kL'}</td>
                  <td className="py-3 px-4 font-bold">{bill.unitsConsumed} {isElec ? 'kWh' : 'kL'}</td>
                  <td className={`py-3 px-4 text-right font-bold ${comparison.unitsChange > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                    {comparison.unitsChange > 0 ? `+${comparison.unitsChange}` : comparison.unitsChange} {isElec ? 'kWh' : 'kL'}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Standing Fixed Charge</td>
                  <td className="py-3 px-4">{currency}{previousBill?.fixedCharges?.toFixed(2)}</td>
                  <td className="py-3 px-4">{currency}{bill.fixedCharges.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    {comparison.categoryDifferences.fixedChargesChange === 0 ? '₹0.00 (Unchanged)' : `${currency}${comparison.categoryDifferences.fixedChargesChange.toFixed(2)}`}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Energy / Volumetric Charges</td>
                  <td className="py-3 px-4">{currency}{previousBill?.energyCharges?.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold">{currency}{bill.energyCharges.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                    +{currency}{comparison.categoryDifferences.consumptionChargesChange.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Taxes, Municipal Duties & Fees</td>
                  <td className="py-3 px-4">{currency}{(previousBill?.taxCharges + previousBill?.otherCharges).toFixed(2)}</td>
                  <td className="py-3 px-4">{currency}{(bill.taxCharges + bill.otherCharges).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-rose-600 dark:text-rose-400">
                    +{currency}{comparison.categoryDifferences.taxesSurchargesChange.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold">
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white">Total Amount Due</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{currency}{previousBill?.totalAmountDue.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white text-sm">{currency}{bill.totalAmountDue.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right text-sm text-rose-600 dark:text-rose-400">
                    +{currency}{comparison.absoluteChange.toFixed(2)} (+{comparison.percentageChange}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Bill Breakdown with Expandable Categories */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm card-print">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-blue-500" />
          Itemized Tariff Breakdown & Rate Tiers
        </h2>

        <div className="space-y-3">
          {Object.keys(groupedLineItems).map((categoryKey) => {
            const items = groupedLineItems[categoryKey];
            const categorySubtotal = items.reduce((acc: number, item: any) => acc + item.amount, 0);
            const isOpen = expandedCategories[categoryKey];

            return (
              <div
                key={categoryKey}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                >
                  <span className="flex items-center gap-2">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span>{categoryKey.replace('_', ' ')} ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {currency}{categorySubtotal.toFixed(2)}
                  </span>
                </button>

                {isOpen && (
                  <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 text-xs">
                    {items.map((item: any) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{item.description}</p>
                          {item.quantity && item.rate && (
                            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              {item.quantity} units × {currency}{item.rate.toFixed(2)}/unit
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                          {currency}{item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Actionable Saving Recommendations */}
      {comparison?.actionableRecommendations && comparison.actionableRecommendations.length > 0 && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 card-print">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Verified Data-Driven Consumption Recommendations
            </h2>
          </div>
          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mb-4">
            Actions calculated specifically from your {bill.unitsConsumed} {isElec ? 'kWh' : 'kL'} usage threshold:
          </p>

          <ul className="space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
            {comparison.actionableRecommendations.map((tip: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
