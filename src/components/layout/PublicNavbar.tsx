import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, LayoutDashboard } from 'lucide-react';
import { BrandLogo } from '../BrandLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const PublicNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { to: '/', label: 'Product' },
    { to: '/features', label: 'Features' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#FAFBFF]/90 backdrop-blur-md border-b border-[#E7EAF1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        <Link to="/" onClick={() => setMobileOpen(false)} aria-label="PayPilot AI Home">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`transition-colors py-1 ${
                isActive(item.to)
                  ? 'text-[#315CFF] font-semibold'
                  : 'text-[#68758C] hover:text-[#18243A]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="/#faq"
            className="text-[#68758C] hover:text-[#18243A] transition-colors py-1"
          >
            FAQ
          </a>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-[#315CFF] hover:bg-[#2347d6] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Workspace</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-[#18243A] hover:text-[#315CFF] px-3.5 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 bg-[#315CFF] hover:bg-[#2347d6] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="md:hidden p-2 rounded-xl text-[#18243A] hover:bg-[#EAF1FF] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E7EAF1] px-4 py-4 space-y-2 shadow-lg">
          {navLinks.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive(item.to)
                  ? 'bg-[#EAF1FF] text-[#315CFF] font-semibold'
                  : 'text-[#18243A] hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="/#faq"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#18243A] hover:bg-slate-50"
          >
            FAQ
          </a>
          <div className="pt-3 border-t border-[#E7EAF1] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center bg-[#315CFF] text-white text-sm font-semibold py-2.5 rounded-xl"
              >
                Open Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center border border-[#E7EAF1] text-[#18243A] text-sm font-semibold py-2.5 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center bg-[#315CFF] text-white text-sm font-semibold py-2.5 rounded-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
