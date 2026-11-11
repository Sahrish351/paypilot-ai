import React from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import { ViewMode } from '../types.ts';
import {
  LayoutDashboard,
  CreditCard,
  Bot,
  Users,
  LineChart,
  FileText,
  Workflow,
  Settings,
  HelpCircle,
  Rocket,
  ChevronDown,
  LogOut,
  Sparkles,
  Home,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onSignOut,
  userName = 'John Doe',
  userEmail = 'john@example.com',
  avatarUrl = '/src/assets/images/avatar_john_doe_1794391937937.jpg',
}) => {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'payments' as ViewMode, label: 'Payments', icon: CreditCard },
    { id: 'ai-agent' as ViewMode, label: 'AI Assistant', icon: Bot, badge: 'New' },
    { id: 'clients' as ViewMode, label: 'Clients', icon: Users },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: LineChart },
    { id: 'reports' as ViewMode, label: 'Reports', icon: FileText },
    { id: 'automation' as ViewMode, label: 'Automation', icon: Workflow },
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
    { id: 'help' as ViewMode, label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#0E382A] text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-[#154635] select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-6 border-b border-[#154635]/60 flex items-center justify-between">
          <BrandLogo
            variant="light"
            size="md"
            onClick={() => onNavigate('dashboard')}
          />
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-320px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1DB97D] text-[#0A2E22] font-bold shadow-md shadow-emerald-950/20'
                    : 'text-[#C9DDD4] hover:bg-[#144735] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-[#0A2E22]' : 'text-[#8EA89C]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#174B38] text-[#34D399] border border-[#287052]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Upgrade to Pro Plan & User profile */}
      <div className="p-4 space-y-3 border-t border-[#154635]/80">
        {/* Upgrade to Pro Plan Card matching reference screenshot */}
        <div className="bg-[#144735]/70 border border-[#23604A] p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#1DB97D]/20 text-[#1DB97D] flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                Upgrade to Pro Plan
              </div>
              <div className="text-[11px] text-[#A6C5B8] leading-tight mt-0.5">
                Unlock advanced features and higher limits.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="w-full mt-2 bg-[#1DB97D] hover:bg-[#17a870] text-[#0A2E22] font-bold text-xs py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>

        {/* User Profile Bar */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-[#144735] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={avatarUrl}
                alt={userName}
                className="w-9 h-9 rounded-full object-cover border border-[#23604A] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-[#A6C5B8] truncate">
                  {userEmail}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#8EA89C] shrink-0" />
          </div>

          {/* User Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0A2E22] border border-[#23604A] rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('landing');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#C9DDD4] hover:text-white hover:bg-[#144735] rounded-lg transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Landing Page</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#C9DDD4] hover:text-white hover:bg-[#144735] rounded-lg transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </button>
              <div className="border-t border-[#154635] my-1" />
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-900/40 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
