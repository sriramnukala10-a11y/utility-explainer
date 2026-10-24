'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  CreditCard,
  AlertTriangle,
  ClipboardList,
  Bell,
  Settings,
  ShieldCheck,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  Zap,
  Droplets,
  ArrowUp,
  MessageSquare,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useTheme } from './theme-provider';
import { useAuth } from './auth-context';
import { SiteSearchModal } from './site-search-modal';

import { Suspense } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'My Bills', href: '/bills', icon: FileText },
  { name: 'Bill Explainer', href: '/bills/bill_priya_elec_oct2026', icon: Zap },
  { name: 'Payments & Tracking', href: '/payments', icon: CreditCard },
  { name: 'Report Outage / Issue', href: '/report', icon: AlertTriangle },
  { name: 'Service Tickets', href: '/tickets', icon: ClipboardList },
  { name: 'Service Updates', href: '/notifications', icon: Bell },
  { name: 'Help Center & FAQs', href: '/faq', icon: HelpCircle },
  { name: 'Contact Support', href: '/support', icon: MessageSquare },
  { name: 'Account Settings', href: '/settings', icon: Settings },
  { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck, adminOnly: true },
];

export function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { user, switchDemoUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll Progress & Back-to-Top Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const currentProgress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
      setScrollProgress(currentProgress);
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Global Scroll Progress Bar */}
      <div
        id="scroll-progress"
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500 z-50 transition-all duration-75 no-print"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  ClarUtility
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Self-Explaining
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                  Electricity & Water Consumer Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Site-wide Search Bar Button */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 transition shadow-inner"
              aria-label="Open Site Search"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search bills, tickets (UTIL-2026...), outages, tariffs...</span>
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 shadow-xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Actions & Profile Area */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Role Demo Switcher */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {isAdmin ? 'Admin View' : 'Customer View'}
              </span>
              <button
                onClick={() => switchDemoUser(isAdmin ? 'CUSTOMER' : 'ADMIN')}
                className="ml-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-1 py-0.5"
                title="Toggle between customer and admin perspective"
              >
                Switch to {isAdmin ? 'Customer' : 'Admin'}
              </button>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {user?.name ? user.name[0] : 'P'}
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white block leading-tight">
                  {user?.name || 'Priya Sharma'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  {user?.role || 'CUSTOMER'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Responsive Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 no-print">
          <nav className="sticky top-24 space-y-1 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm" aria-label="Sidebar Navigation">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Customer Services
            </div>
            {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.name}</span>
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Quick Demo Credentials Help */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 px-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">Sample Demo Accounts:</span>
              <p>Customer: <code className="text-[10px] text-blue-600 dark:text-blue-400">priya.sharma@example.com</code></p>
              <p>Admin: <code className="text-[10px] text-blue-600 dark:text-blue-400">admin@utilityservice.gov</code></p>
              <p className="text-[10px] text-slate-400">Pass: <code className="text-[10px]">UtilityPass123!</code></p>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            <div
              className="w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 shadow-2xl p-4 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    ClarUtility Menu
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${active
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    switchDemoUser(isAdmin ? 'CUSTOMER' : 'ADMIN');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-medium text-center bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Switch to {isAdmin ? 'Customer' : 'Admin'} View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Floating Contact Support Button */}
      <Link
        id="floating-support-btn"
        href="/support"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-teal-500 text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group no-print"
        aria-label="Contact Customer Support"
        title="Need Help? Contact 24/7 Utility Support"
      >
        <MessageSquare className="w-5 h-5 fill-white" />
        <span className="text-xs font-semibold pr-1 hidden sm:inline-block max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
          Support
        </span>
      </Link>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          id="back-to-top-btn"
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-40 bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 p-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all no-print animate-in fade-in"
          aria-label="Scroll back to top"
          title="Scroll back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Site-wide Search Modal */}
      <SiteSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
