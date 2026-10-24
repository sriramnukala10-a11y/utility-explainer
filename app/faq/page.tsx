'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Droplets,
  CreditCard,
  ShieldCheck,
  Search,
  MessageSquare,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'tariffs',
    category: 'Billing & Tariffs',
    question: 'How do progressive tariff slabs work, and why did my bill jump suddenly?',
    answer:
      'Electricity and water utilities use progressive telescopic tiers to encourage conservation. In our LT-2 electricity tariff, your first 100 kWh are charged at the subsidized rate of ₹3.50/kWh, the next 200 units (101–300 kWh) at ₹5.20/kWh, and units above 300 kWh at ₹7.50/kWh. If your household consumption crosses 300 units by even 18 units, those 18 units are billed at the highest tier, and higher proportional electricity duties apply. Our Bill Explanation tool breaks down the exact cost contributed by each unit.',
  },
  {
    id: 'unknown-payments',
    category: 'Payments & Banking',
    question: 'What should I do if my payment status is marked UNKNOWN?',
    answer:
      'An UNKNOWN status occurs when a bank or UPI gateway fails to return a conclusive settlement response within the HTTP timeout window (for example, if a gateway server returns HTTP 504). Our backend automatically schedules an asynchronous reconciliation check with the bank ledger. Do NOT initiate a duplicate charge. If the bank captured funds, the transaction transitions to SUCCESSFUL within 15–30 minutes and updates your bill balance. If the bank reversed the charge, your bill remains due with no duplicate deduction.',
  },
  {
    id: 'water-sewerage',
    category: 'Billing & Tariffs',
    question: 'Why is there a Sewerage & Effluent Sanitation Cess on my water bill?',
    answer:
      'Municipal water supply boards incur costs not only for pumping potable water to your premises, but also for treating wastewater through underground sewerage networks and sewage treatment plants (STPs). The sewerage charge is calculated as a fixed percentage (20%) of your volumetric water consumption charges.',
  },
  {
    id: 'outage-tracking',
    category: 'Outages & Repairs',
    question: 'How does field crew dispatch work after I report a power cut or water burst?',
    answer:
      'Submitting a report creates an authenticated ticket formatted as UTIL-2026-XXXXXX. The report is routed directly to the regional operations room. A dispatch engineer acknowledges the feeder or distribution transformer, assigns an on-duty field technician or line squad, and logs progress updates. You can track live field status changes and add premises access notes in your Service Tickets tab.',
  },
  {
    id: 'meter-leak-check',
    category: 'Water Conservation',
    question: 'How can I perform a simple home water meter leak test?',
    answer:
      'Turn off all household taps, showers, washing machines, and water purifiers. Do not flush any toilets for 30 minutes. Check your mechanical or digital water meter. If the red indicator dial or flow numbers continue moving while all fixtures are closed, an underground line leak or leaking toilet flush cistern is present.',
  },
  {
    id: 'payment-receipts',
    category: 'Payments & Banking',
    question: 'When is an official utility payment receipt generated?',
    answer:
      'An official receipt (e.g. RCP-2026-XXXXXX) is generated ONLY after verified cryptographic webhook confirmation or authenticated settlement response from the acquiring bank. We never issue receipts based on client-side button clicks or browser return redirects.',
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState('');
  const [openItem, setOpenItem] = useState<string | null>('tariffs');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-blue-500" />
          Help Center & Utility Knowledge Base
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Everything you need to know about tariff tiers, meter verification, payment reconciliation, and service issue workflows.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs (e.g. slab, unknown payment, leak, receipt)..."
            className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'Billing & Tariffs', 'Payments & Banking', 'Outages & Repairs', 'Water Conservation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No FAQ articles match your search query. Try another term or contact support.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openItem === faq.id;
            return (
              <div
                key={faq.id}
                id={faq.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Need More Assistance Card */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 rounded-2xl border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Still have questions about your utility account?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Our engineering desk and tariff specialists are available 24/7 to resolve disputed bills and service complaints.
          </p>
        </div>
        <Link
          href="/support"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Contact Support Desk</span>
        </Link>
      </div>
    </div>
  );
}
