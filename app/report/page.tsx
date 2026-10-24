'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Zap,
  Droplets,
  CheckCircle2,
  Camera,
  MapPin,
  Phone,
  Mail,
  Send,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { VALID_CATEGORIES } from '@/lib/ticket-manager';

export default function ReportIssuePage() {
  const { user } = useAuth();
  const [utilityType, setUtilityType] = useState<'ELECTRICITY' | 'WATER' | 'BOTH'>('ELECTRICITY');
  const [category, setCategory] = useState<string>('POWER_CUT');
  const [description, setDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState(
    'Flat 402, Green Acres Apt, Indiranagar, Bengaluru 560038'
  );
  const [landmark, setLandmark] = useState('Near Indiranagar Club');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [contactEmail, setContactEmail] = useState(user?.email || 'priya.sharma@example.com');
  const [contactPreference, setContactPreference] = useState('SMS');

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      const res = await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilityType,
          category,
          description,
          serviceAddress,
          landmark,
          contactPhone,
          contactEmail,
          contactPreference,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedTicket(data.data);
      } else {
        setErrorMessage(data.error || 'Failed to submit report');
        if (data.details) setFieldErrors(data.details);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Report Registered Successfully
          </span>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Ticket #{submittedTicket.ticketNumber}
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Your service report has been queued at the operations triage desk. An automated dispatch notification has been scheduled to your {submittedTicket.contactPreference} ({submittedTicket.contactPhone || submittedTicket.contactEmail}).
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-left max-w-md mx-auto space-y-1.5 border border-slate-200 dark:border-slate-800">
            <p><strong>Category:</strong> {submittedTicket.category}</p>
            <p><strong>Location:</strong> {submittedTicket.serviceAddress}</p>
            <p><strong>Priority:</strong> {submittedTicket.priority}</p>
            <p><strong>Status:</strong> <span className="font-semibold text-blue-600 dark:text-blue-400">{submittedTicket.status}</span></p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href={`/tickets/${submittedTicket.id}`}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition flex items-center gap-2"
            >
              <span>Track Live Status & Dispatch Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          Report Outage or Utility Service Problem
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Report power failures, low water pressure, leaking mains, or meter malfunctions directly to engineering dispatch.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Step 1: Utility Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            1. Select Utility Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'ELECTRICITY', label: 'Electricity Outage', icon: Zap, color: 'text-blue-500' },
              { type: 'WATER', label: 'Water Problem', icon: Droplets, color: 'text-teal-500' },
              { type: 'BOTH', label: 'Both / Combined', icon: AlertTriangle, color: 'text-amber-500' },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = utilityType === item.type;
              return (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setUtilityType(item.type as any)}
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-2 transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Issue Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
            2. Issue Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(VALID_CATEGORIES).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label} (Default Priority: {info.defaultPriority})
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            3. Detailed Description of the Problem *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please specify what happened (e.g. total blackout, sparks from pole transformer, water line burst on main street)... Minimum 15 characters."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={15}
          />
          {fieldErrors.description && (
            <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.description[0]}</p>
          )}
          <span className="text-[10px] text-slate-400 block mt-1">
            {description.length} / 15 characters minimum
          </span>
        </div>

        {/* Step 4: Service Address & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              4. Service Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {fieldErrors.serviceAddress && (
              <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.serviceAddress[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Prominent Landmark
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Opposite Pillar 45, Near Bank ATM"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Step 5: Contact Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Notification Channel
            </label>
            <select
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SMS">SMS Text Messages</option>
              <option value="EMAIL">Email Updates</option>
              <option value="PHONE">Phone Call for Critical Issues</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Registering with Dispatch Desk...' : 'Submit Incident Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
