'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Key,
  MapPin,
  CheckCircle2,
  Moon,
  Sun,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/components/auth-context';
import { useTheme } from '@/components/theme-provider';

export default function SettingsPage() {
  const { user, switchDemoUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('utility_cookie_consent');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnalyticsConsent(Boolean(parsed.analyticsConsent));
        setMarketingConsent(Boolean(parsed.marketingConsent));
      } catch {}
    }
  }, []);

  const handleSaveCookiePreferences = async () => {
    const consentObj = {
      functionalConsent: true,
      analyticsConsent,
      marketingConsent,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('utility_cookie_consent', JSON.stringify(consentObj));

    try {
      await fetch('/api/v1/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsConsent,
          functionalConsent: true,
          marketingConsent,
        }),
      });
    } catch {}

    setSavedSuccess('Privacy and cookie preferences saved successfully.');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-500" />
          Account & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your customer profile, registered service connections, privacy choices, and authentication.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Customer Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              disabled
              value={user?.name || 'Priya Sharma'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || 'priya.sharma@example.com'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Registered Phone</label>
            <input
              type="text"
              disabled
              value={user?.phone || '+91 98765 43210'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Access Role</label>
            <input
              type="text"
              disabled
              value={user?.role || 'CUSTOMER'}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium uppercase"
            />
          </div>
        </div>
      </div>

      {/* Registered Service Connections */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-500" />
          Active Utility Connections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-blue-600 dark:text-blue-400 block">
              Domestic Electricity (LT-2)
            </span>
            <p>Consumer Account: <strong className="font-mono">ELEC-882941</strong></p>
            <p>Meter Serial: <code className="font-mono">MTR-EL-90142</code> (Smart Bi-directional)</p>
            <p className="text-slate-500">Service: Flat 402, Green Acres Apt, Indiranagar, Bengaluru</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-teal-600 dark:text-teal-400 block">
              Residential Potable Water (BWSSB)
            </span>
            <p>Consumer Account: <strong className="font-mono">WATR-441029</strong></p>
            <p>Meter Serial: <code className="font-mono">MTR-WT-31890</code> (Volumetric Flow)</p>
            <p className="text-slate-500">Service: Flat 402, Green Acres Apt, Indiranagar, Bengaluru</p>
          </div>
        </div>
      </div>

      {/* Privacy and Cookie Consent Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Privacy & Cookie Consent Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          In accordance with consumer privacy standards, you can alter your consent preferences at any time. Essential security and session cookies remain active.
        </p>

        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Strictly Necessary Cookies</span>
              <span className="text-[11px] text-slate-400">Required for authentication, session verification and anti-CSRF tokens.</span>
            </div>
            <span className="text-emerald-600 font-bold text-[11px] uppercase">Always Active</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Anonymous Analytics Cookies</span>
              <span className="text-[11px] text-slate-400">Permits measuring bill explainer usability without capturing personal identity.</span>
            </div>
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Energy Conservation Advisory Notices</span>
              <span className="text-[11px] text-slate-400">Personalized efficiency tips based on seasonal climate trends.</span>
            </div>
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-400 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveCookiePreferences}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition"
            >
              Save Privacy Choices
            </button>
          </div>
        </div>
      </div>

      {/* Demo Perspective Switcher */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-300 dark:border-slate-700 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Demonstration Perspective Switcher
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Switch instantly between consumer and administrative perspectives to evaluate features:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => switchDemoUser('CUSTOMER')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
          >
            Priya Sharma (Primary Consumer)
          </button>
          <button
            onClick={() => switchDemoUser('CUSTOMER_2')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
          >
            Rahul Verma (Secondary Consumer)
          </button>
          <button
            onClick={() => switchDemoUser('ADMIN')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-500 shadow-xs"
          >
            Chief Utility Administrator (Admin RBAC)
          </button>
        </div>
      </div>
    </div>
  );
}
