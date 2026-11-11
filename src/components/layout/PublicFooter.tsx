import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../BrandLogo.tsx';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#101C3A] text-white border-t border-[#1D2D56]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <BrandLogo variant="light" size="md" />
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Your AI Payment Agent. From conversation to completed payment—built for freelancers, consultants, and small businesses.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#7ADCF0]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>PayPal Sandbox Mode • Human-Approved Requests</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Product</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/ai-agent" className="hover:text-white transition-colors">
                  AI Payment Agent
                </Link>
              </li>
              <li>
                <Link to="/payments" className="hover:text-white transition-colors">
                  Payments
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="hover:text-white transition-colors">
                  Transactions
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Source & Docs</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a
                  href="https://github.com/Sahrish351/paypilot-ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sahrish351/paypilot-ai#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Project Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} PayPilot AI. MIT License.
          </p>
          <p className="max-w-xl sm:text-right leading-relaxed">
            Independent hackathon project built with Gemini AI and PayPal Sandbox APIs. Not affiliated with, sponsored by, or officially endorsed by PayPal.
          </p>
        </div>
      </div>
    </footer>
  );
};
