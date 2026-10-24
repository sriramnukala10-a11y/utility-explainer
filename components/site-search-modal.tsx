'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, FileText, AlertTriangle, LifeBuoy, CreditCard, ChevronRight, Zap, Droplets } from 'lucide-react';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: 'PAGE' | 'BILL' | 'TICKET' | 'ALERT' | 'HELP';
}

const STATIC_SEARCH_ITEMS: SearchResultItem[] = [
  { id: 'p_home', title: 'Dashboard Overview', subtitle: 'Account balances, latest bills & service overview', href: '/', category: 'PAGE' },
  { id: 'p_bills', title: 'My Bills', subtitle: 'View historical electricity and water billing statements', href: '/bills', category: 'PAGE' },
  { id: 'p_exp', title: 'Bill Explanation Engine', subtitle: 'Understand rate slabs, tier breakdowns & cost differences', href: '/bills/bill_priya_elec_oct2026', category: 'PAGE' },
  { id: 'p_payments', title: 'Payments & Transaction Tracking', subtitle: 'Track pending, unknown or settled utility payments', href: '/payments', category: 'PAGE' },
  { id: 'p_report', title: 'Report Outage or Issue', subtitle: 'File a power cut, water leakage or meter problem report', href: '/report', category: 'PAGE' },
  { id: 'p_tickets', title: 'My Service Tickets', subtitle: 'Track reported issues, status timeline and staff notes', href: '/tickets', category: 'PAGE' },
  { id: 'p_notifs', title: 'Notifications & Alerts', subtitle: 'Service restoration notices and bill due updates', href: '/notifications', category: 'PAGE' },
  { id: 'p_faq', title: 'Help Center & FAQs', subtitle: 'How tariff tiers work, payment security & meter reading guides', href: '/faq', category: 'HELP' },
  { id: 'p_support', title: 'Contact Support', subtitle: 'Reach utility engineering and billing support desks', href: '/support', category: 'PAGE' },
  { id: 'p_settings', title: 'Account Settings & Tariffs', subtitle: 'Manage address connections and privacy choices', href: '/settings', category: 'PAGE' },
  { id: 'p_admin', title: 'Admin Dashboard', subtitle: 'Administrative triage, reconciliation ledger and alert broadcast', href: '/admin', category: 'PAGE' },

  // Pre-indexed sample items
  { id: 'b_oct_elec', title: 'Electricity Bill #BILL-2026-10-8829', subtitle: 'Oct 2026 • 318 kWh • ₹1,912.41 • Unpaid', href: '/bills/bill_priya_elec_oct2026', category: 'BILL' },
  { id: 'b_sep_elec', title: 'Electricity Bill #BILL-2026-09-8829', subtitle: 'Sep 2026 • 240 kWh • ₹1,403.92 • Paid', href: '/bills/bill_priya_elec_sep2026', category: 'BILL' },
  { id: 'b_oct_watr', title: 'Water Bill #BILL-2026-10-4410', subtitle: 'Oct 2026 • 26 kL • ₹510.40 • Unpaid', href: '/bills/bill_priya_watr_oct2026', category: 'BILL' },
  { id: 't_voltage', title: 'Ticket #UTIL-2026-000101', subtitle: 'Voltage Fluctuation • Indiranagar • In Progress', href: '/tickets/tkt_01', category: 'TICKET' },
  { id: 't_leakage', title: 'Ticket #UTIL-2026-000102', subtitle: 'Water Leakage • Main pipe burst • Acknowledged', href: '/tickets/tkt_02', category: 'TICKET' },
  { id: 'a_substation', title: 'Substation Transformer Maintenance Alert', subtitle: 'Indiranagar 1st & 2nd Stage • Oct 26', href: '/notifications', category: 'ALERT' },
  { id: 'h_tariffs', title: 'How does progressive slab billing work?', subtitle: 'Learn why jumping into Slab 3 increases your unit rate', href: '/faq#tariffs', category: 'HELP' },
  { id: 'h_unknown', title: 'What should I do if my payment status is UNKNOWN?', subtitle: 'Guidance on automated bank reconciliation and timeouts', href: '/faq#unknown-payments', category: 'HELP' },
];

export function SiteSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(STATIC_SEARCH_ITEMS.slice(0, 6));
      return;
    }
    const q = query.toLowerCase();
    const filtered = STATIC_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setResults(STATIC_SEARCH_ITEMS.slice(0, 6));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCategoryBadge = (cat: SearchResultItem['category']) => {
    switch (cat) {
      case 'BILL':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Bill</span>;
      case 'TICKET':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Ticket</span>;
      case 'ALERT':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Alert</span>;
      case 'HELP':
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Guide</span>;
      default:
        return <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Page</span>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Site Search"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bills, tickets (UTIL-2026...), outages, tariffs..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/50">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No matching bills, tickets or articles found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.category === 'BILL' && <FileText className="w-4 h-4 text-blue-500" />}
                    {item.category === 'TICKET' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {item.category === 'ALERT' && <Zap className="w-4 h-4 text-rose-500" />}
                    {item.category === 'HELP' && <LifeBuoy className="w-4 h-4 text-emerald-500" />}
                    {item.category === 'PAGE' && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {item.title}
                      </span>
                      {getCategoryBadge(item.category)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-0.5" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
