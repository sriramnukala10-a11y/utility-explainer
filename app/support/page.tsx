'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';

export default function ContactSupportPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [email, setEmail] = useState(user?.email || 'priya.sharma@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [category, setCategory] = useState('BILLING_INQUIRY');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, category, subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit support request');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          Contact Utility Support & Dispatch
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Reach our customer ombudsman, billing dispute officers, and emergency infrastructure dispatch teams.
        </p>
      </div>

      {/* Emergency Hotlines Banner */}
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          24/7 Immediate Utility Emergency Hotlines
        </div>
        <p className="text-xs text-rose-900/80 dark:text-rose-300 leading-relaxed">
          For active life safety hazards (snapped live power line, sparking transformer, gas odor, or flooding from main pipeline burst), contact direct field emergency dispatch immediately:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Electricity Emergency Dispatch</span>
              <span className="text-[11px] text-slate-500">BESCOM Toll-Free</span>
            </div>
            <a href="tel:1912" className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              Dial 1912
            </a>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/80 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Water Supply & Sewerage Burst</span>
              <span className="text-[11px] text-slate-500">BWSSB 24/7 Helpline</span>
            </div>
            <a href="tel:1916" className="text-base font-extrabold text-teal-600 dark:text-teal-400 font-mono">
              Dial 1916
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Support Form & Desk Office Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Inquiry Logged Successfully
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, {name}. A customer support representative has been assigned to your ticket. A confirmation has been recorded with reference to your email ({email}).
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Submit an Inquiry or Dispute Request
              </h2>

              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BILLING_INQUIRY">Billing & Calculation Dispute</option>
                    <option value="PAYMENT_RECONCILIATION">Payment Reconciliation & Deduction Issue</option>
                    <option value="METER_ACCURACY">Meter Replacement & Testing</option>
                    <option value="NEW_CONNECTION">New Connection Application</option>
                    <option value="GENERAL_FEEDBACK">General Feedback & Suggestion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Disputing Slab 3 charge on Oct bill"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your query or dispute with relevant meter serial numbers or payment reference IDs..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Transmitting to Support Desk...' : 'Submit Support Request'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Support Desk Office Details */}
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" />
              Central Operations Headquarters
            </h3>
            <p>
              ClarUtility Central Grievance Redressal Cell<br />
              Cauvery Bhavan, K.G. Road<br />
              Bengaluru, Karnataka 560009
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500">
              <p>Working Hours: Mon–Sat, 09:30 AM – 05:30 PM IST</p>
              <p>Emergency Triage: 24 Hours / 7 Days a Week</p>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Consumer Ombudsman Assurance
            </h3>
            <p className="leading-relaxed">
              Every disputed bill calculation is independently verified against meter SCADA time-series logs. If any faulty estimation is discovered, credit adjustments are automatically credited to your next billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
