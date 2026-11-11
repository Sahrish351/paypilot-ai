import React, { useState } from 'react';
import { Search, Bell, Plus, CheckCircle2, Bot, Sparkles, X } from 'lucide-react';

interface TopHeaderProps {
  onOpenCreatePayment: () => void;
  onOpenAI: () => void;
  avatarUrl?: string;
  userName?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenCreatePayment,
  onOpenAI,
  avatarUrl = '/src/assets/images/avatar_john_doe_1794391937937.jpg',
  userName = 'John Doe',
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Payment Received',
      message: 'Alex Morgan completed payment of $1,250.00 via PayPal Sandbox.',
      time: '10m ago',
      read: false,
    },
    {
      id: '2',
      title: 'AI Proposal Ready',
      message: 'Payment request for Business Website Development ready for approval.',
      time: '1h ago',
      read: false,
    },
    {
      id: '3',
      title: 'PayPal Sandbox Verified',
      message: 'Orders API v2 is active and ready for live sandbox testing.',
      time: '2h ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-[#FAF9F5] border-b border-[#E8EAE5] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & Search bar matching screenshot */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-700 hover:bg-[#E7F1E9] rounded-lg"
          >
            <span className="sr-only">Open menu</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-[#F2F1EC] hover:bg-[#EAE8E1] focus:bg-white text-xs sm:text-sm pl-9 pr-4 py-2 rounded-xl border border-transparent focus:border-[#174B38] focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Quick actions, notifications bell, user avatar */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          onClick={onOpenAI}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#174B38] bg-[#E7F1E9] hover:bg-[#D7E8DB] px-3 py-1.5 rounded-full border border-[#CCE2D2] transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>AI Assistant</span>
        </button>

        <button
          onClick={onOpenCreatePayment}
          className="bg-[#174B38] hover:bg-[#11382A] text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Payment</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#EAE8E1] relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Drawer/Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#E7F1E9] text-[#174B38] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-[#174B38] hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`py-3 px-1 flex gap-3 ${n.read ? 'opacity-70' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#E7F1E9] text-[#174B38] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900">{n.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-300">
          <img
            src={avatarUrl}
            alt={userName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
