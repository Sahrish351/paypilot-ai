import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  Receipt,
  Users,
  Sparkles,
  FileSpreadsheet,
  Settings,
  LogOut,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { NotificationRecord } from '../../types.ts';

interface AppShellProps {
  children: React.ReactNode;
  onOpenCreatePayment: () => void;
  globalSearch?: string;
  onGlobalSearchChange?: (val: string) => void;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ai-agent', label: 'AI Payment Agent', icon: Bot, badge: 'AI' },
  { path: '/payments', label: 'Payment Requests', icon: CreditCard },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/clients', label: 'Clients', icon: Users },
  { path: '/insights', label: 'AI Insights', icon: Sparkles },
  { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onOpenCreatePayment,
  globalSearch = '',
  onGlobalSearchChange,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [localSearch, setLocalSearch] = useState(globalSearch);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, location.pathname]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch('/api/dashboard/notifications/read-all', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleSearchInput = (value: string) => {
    setLocalSearch(value);
    onGlobalSearchChange?.(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    if (location.pathname === '/dashboard') {
      navigate(`/payments?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const SidebarContent = (
    <aside className="w-64 bg-[#101C3A] text-white flex flex-col justify-between h-full select-none border-r border-[#1C2C54]">
      <div>
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <BrandLogo variant="light" size="md" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3.5 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#315CFF] text-white shadow-md shadow-[#315CFF]/30'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#7ADCF0]'}`} />
                  <span>{item.label}</span>
                </span>
                {item.badge && !active && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#315CFF]/25 text-[#7ADCF0]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 border-t border-white/10 space-y-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#38C6D9] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">PayPal Sandbox Mode</div>
            <div className="text-[10px] text-slate-400">Test environment • Human-approved</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#315CFF] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#18243A] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen">{SidebarContent}</div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#101C3A]/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#E7EAF1] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#18243A] hover:bg-[#EAF1FF] cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-[#68758C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={e => handleSearchInput(e.target.value)}
                placeholder="Search requests, clients, transactions..."
                className="w-full bg-[#FAFBFF] border border-[#E7EAF1] focus:border-[#315CFF] focus:bg-white rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#18243A] placeholder:text-[#68758C] focus:outline-none transition-colors"
              />
            </form>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              to="/ai-agent"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#315CFF] bg-[#EAF1FF] hover:bg-[#dce7ff] px-3.5 py-2 rounded-xl transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Agent</span>
            </Link>

            <button
              onClick={onOpenCreatePayment}
              className="inline-flex items-center gap-1.5 bg-[#315CFF] hover:bg-[#2347d6] text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Payment</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(p => !p)}
                className="p-2 rounded-xl text-[#68758C] hover:text-[#18243A] hover:bg-[#EAF1FF] relative transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#315CFF] ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E7EAF1] shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF1]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#101C3A]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF1FF] text-[#315CFF]">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#315CFF] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1 text-[#68758C] hover:text-[#18243A] cursor-pointer"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E7EAF1]">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#68758C]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`py-3 flex items-start gap-3 ${n.read ? 'opacity-65' : ''}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-[#EAF1FF] text-[#315CFF] flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#18243A]">{n.title}</div>
                            <p className="text-[11px] text-[#68758C] mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
