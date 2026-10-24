'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, X, Check } from 'lucide-react';

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('utility_cookie_consent');
    if (!saved) {
      // Show banner if not yet decided
      setIsOpen(true);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setAnalyticsConsent(Boolean(parsed.analyticsConsent));
        setMarketingConsent(Boolean(parsed.marketingConsent));
      } catch {
        setIsOpen(true);
      }
    }
  }, []);

  const saveConsent = async (analytics: boolean, marketing: boolean) => {
    const consentObj = {
      functionalConsent: true, // Essential session cookies always true
      analyticsConsent: analytics,
      marketingConsent: marketing,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('utility_cookie_consent', JSON.stringify(consentObj));
    setAnalyticsConsent(analytics);
    setMarketingConsent(marketing);
    setIsOpen(false);
    setShowSettings(false);

    try {
      await fetch('/api/v1/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyticsConsent: analytics,
          functionalConsent: true,
          marketingConsent: marketing,
        }),
      });
    } catch (err) {
      console.warn('Could not record consent on server:', err);
    }
  };

  const handleAcceptAll = () => saveConsent(true, true);
  const handleRejectOptional = () => saveConsent(false, false);
  const handleSavePreferences = () => saveConsent(analyticsConsent, marketingConsent);

  if (!isOpen && !showSettings) {
    return (
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-4 left-4 z-40 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 backdrop-blur-sm border border-slate-700 no-print"
        title="Privacy & Cookie Preferences"
        aria-label="Manage Privacy Preferences"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Cookie Settings</span>
      </button>
    );
  }

  return (
    <div
      id="cookie-banner"
      className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-slate-900/95 text-slate-100 border-t border-slate-800 backdrop-blur-md shadow-2xl transition-all no-print animate-in slide-in-from-bottom duration-300"
      role="region"
      aria-label="Privacy and Cookie Consent"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-semibold text-white">Your Privacy & Cookie Choices</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            We use strictly essential cookies for secure login and account sessions. With your permission, we also use anonymized analytical cookies to understand how customers navigate confusing bills and service updates. We never sell personal data or track banking credentials.
          </p>

          {showSettings && (
            <div className="mt-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-white">Strictly Necessary Cookies</span>
                  <p className="text-slate-400 text-[11px]">Required for login, bill security, and session persistence.</p>
                </div>
                <span className="text-emerald-400 text-[11px] font-semibold uppercase">Always Active</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-700 pt-2">
                <div>
                  <span className="font-medium text-white">Anonymous Analytics Cookies</span>
                  <p className="text-slate-400 text-[11px]">Helps identify calculation errors and site usability bottlenecks.</p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  aria-label="Toggle Analytics Cookies"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {!showSettings ? (
            <>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-md border border-slate-700 transition"
              >
                Customize
              </button>
              <button
                onClick={handleRejectOptional}
                className="px-3.5 py-2 text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-md border border-slate-600 transition"
              >
                Reject Optional
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 rounded-md shadow-sm transition"
              >
                Accept All
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-2 text-xs text-slate-300 hover:text-white rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 rounded-md shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
