import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo.tsx';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Settings2,
  Play,
  ArrowRight,
  CheckCircle2,
  Bot,
  Sparkles,
  Rocket,
  CreditCard,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreDashboard,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E2924] flex flex-col font-sans selection:bg-[#E7F1E9] selection:text-[#174B38]">
      {/* 1. Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E8EAE5]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <BrandLogo size="md" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4B5550]">
            <a
              href="#home"
              className="text-[#174B38] font-semibold hover:text-[#174B38] transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-[#174B38] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#174B38] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="hover:text-[#174B38] transition-colors"
            >
              Pricing
            </a>
            <button
              onClick={onExploreDashboard}
              className="hover:text-[#174B38] transition-colors inline-flex items-center gap-1 text-[#287052]"
            >
              Live Demo
            </button>
          </nav>

          {/* Desktop CTA actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="text-sm font-semibold text-[#174B38] hover:text-[#287052] px-4 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#174B38] hover:bg-[#12382a] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-95"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#174B38] hover:bg-[#E7F1E9] rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E8EAE5] px-4 pt-3 pb-6 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#1E2924] font-medium py-1.5"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#1E2924] font-medium py-1.5"
            >
              How It Works
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onExploreDashboard();
              }}
              className="block w-full text-left text-[#287052] font-semibold py-1.5"
            >
              Open Live Dashboard
            </button>
            <div className="pt-3 border-t border-[#E8EAE5] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignIn();
                }}
                className="w-full text-center py-2 text-sm font-semibold text-[#174B38] border border-[#174B38] rounded-full"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGetStarted();
                }}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-[#174B38] rounded-full"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Decorative soft mint background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[550px] h-[550px] bg-[#E7F1E9]/70 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-0 -ml-24 w-[400px] h-[400px] bg-[#DCE9DF]/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-6 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F1E9] border border-[#CCE2D2] text-[#174B38] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                <span>AI-Powered • PayPal Integrated</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#174B38] leading-[1.12]">
                PayPilot AI
                <span className="block text-[#1E2924] font-bold mt-1 text-3xl sm:text-4xl lg:text-[2.75rem]">
                  Your Intelligent Payment Companion
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#55635B] leading-relaxed max-w-xl">
                Send, receive, and manage payments with the power of AI. Let your AI agent handle payments, answer questions, and help you grow your business.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="bg-[#174B38] hover:bg-[#11382A] text-white font-semibold text-base px-6 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group active:scale-95"
                >
                  <span>Start for Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => setShowDemoModal(true)}
                  className="bg-white hover:bg-[#F3F4F0] text-[#174B38] border border-[#CCE2D2] font-semibold text-base px-6 py-3.5 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E7F1E9] flex items-center justify-center text-[#174B38]">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust & PayPal endorsement */}
              <div className="pt-6 border-t border-[#E8EAE5] flex items-center gap-3 text-xs sm:text-sm text-[#66746D]">
                <div className="flex items-center gap-1.5 font-bold text-[#003087]">
                  <CreditCard className="w-4 h-4 text-[#0079C1]" />
                  <span className="italic tracking-tight text-base font-extrabold">
                    PayPal
                  </span>
                </div>
                <span className="text-[#899790]">·</span>
                <span>Trusted by millions worldwide · Sandbox Ready</span>
              </div>
            </div>

            {/* Right Column: Hero Visual with businesswoman & floating UI pills */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                {/* Background circular mint aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#CCE2D2] to-[#E7F1E9] rounded-3xl -rotate-2 scale-98 transition-transform" />

                {/* Main Hero Photograph */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-white">
                  <img
                    src="/src/assets/images/hero_business_woman_1794391937064.jpg"
                    alt="Confident businesswoman using PayPilot AI on smartphone"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  {/* Subtle soft gradient highlight */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating UI Pill 1: Top Right - User prompt bubble */}
                <div className="absolute -top-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-[#CCE2D2] flex items-center gap-2.5 animate-bounce-subtle">
                  <div className="w-7 h-7 rounded-full bg-[#174B38] text-[#34D399] flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#1E2924]">
                    Create a payment link for my client
                  </span>
                </div>

                {/* Floating UI Pill 2: Middle Right - AI confirmation message */}
                <div className="absolute top-[42%] -right-4 sm:-right-8 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-[#CCE2D2] flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#1E2924]">
                    Done! Your PayPal payment link is ready.
                  </span>
                </div>

                {/* Floating UI Pill 3: Bottom Right - Success Banner */}
                <div className="absolute -bottom-4 right-4 sm:right-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-[#CCE2D2] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#174B38]">
                      Payment Link
                    </div>
                    <div className="text-[11px] text-[#52635B] font-medium">
                      Created Successfully!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Smarter Payments. Greater Possibilities. (4 Feature Cards) */}
      <section id="features" className="py-16 sm:py-20 bg-white border-y border-[#E8EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#174B38] tracking-tight">
              Smarter Payments. Greater Possibilities.
            </h2>
            <p className="text-base sm:text-lg text-[#55635B]">
              Discover how PayPilot AI transforms the way you send, receive, and manage money.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: AI Payment Agent */}
            <div className="bg-[#FAF9F5] hover:bg-[#F3F2EB] p-7 rounded-2xl border border-[#E8EAE5] transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6 text-[#10B981]" />
                </div>
                <h3 className="text-xl font-bold text-[#174B38] mb-2">
                  AI Payment Agent
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Let AI handle payments, answer questions, and assist your customers with natural language intelligence.
                </p>
              </div>
              <button
                onClick={onExploreDashboard}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#174B38] hover:text-[#287052] transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 2: PayPal Integration */}
            <div className="bg-[#FAF9F5] hover:bg-[#F3F2EB] p-7 rounded-2xl border border-[#E8EAE5] transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E6F0FA] text-[#0079C1] flex items-center justify-center mb-5">
                  <CreditCard className="w-6 h-6 text-[#0079C1]" />
                </div>
                <h3 className="text-xl font-bold text-[#174B38] mb-2">
                  PayPal Integration
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Secure, reliable, and worldwide payments powered by PayPal Orders API v2 and Developer Sandbox.
                </p>
              </div>
              <button
                onClick={onExploreDashboard}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#174B38] hover:text-[#287052] transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 3: Business Insights */}
            <div className="bg-[#FAF9F5] hover:bg-[#F3F2EB] p-7 rounded-2xl border border-[#E8EAE5] transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6 text-[#10B981]" />
                </div>
                <h3 className="text-xl font-bold text-[#174B38] mb-2">
                  Business Insights
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Get smart revenue analytics, collection velocity forecasts, and grow with data-backed confidence.
                </p>
              </div>
              <button
                onClick={onExploreDashboard}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#174B38] hover:text-[#287052] transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 4: Smart Automation */}
            <div className="bg-[#FAF9F5] hover:bg-[#F3F2EB] p-7 rounded-2xl border border-[#E8EAE5] transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E7F1E9] text-[#174B38] flex items-center justify-center mb-5">
                  <Settings2 className="w-6 h-6 text-[#10B981]" />
                </div>
                <h3 className="text-xl font-bold text-[#174B38] mb-2">
                  Smart Automation
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Automate overdue reminders, invoice drafting, and client follow-ups to save hours every single week.
                </p>
              </div>
              <button
                onClick={onExploreDashboard}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#174B38] hover:text-[#287052] transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Your Business, Supercharged with AI (Dark Forest Banner with Laptop Mockup) */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#174B38] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
            {/* Subtle decorative curved pattern */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-[#287052]/40 rounded-full blur-2xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Laptop Mockup Preview */}
              <div className="lg:col-span-7 relative">
                <div className="bg-slate-900 p-2 sm:p-3 rounded-2xl shadow-2xl border border-slate-700/60 max-w-xl mx-auto">
                  {/* Laptop screen bezel */}
                  <div className="bg-[#FAF9F5] rounded-xl overflow-hidden border border-slate-300">
                    {/* Top mini header bar */}
                    <div className="bg-white px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                        app.paypilot.ai/dashboard
                      </div>
                      <div className="w-3 h-3" />
                    </div>

                    {/* Dashboard Mini Preview Screenshot simulation */}
                    <div className="p-3 bg-[#FAF9F5] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#174B38]">
                          Welcome back, John! 👋
                        </div>
                        <div className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          Last 30 days
                        </div>
                      </div>

                      {/* Mini Stats 4-box */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <div className="text-[9px] text-slate-400">Total Revenue</div>
                          <div className="text-xs font-bold text-slate-900">$12,750</div>
                          <div className="text-[8px] text-emerald-600 font-medium">↑ +12.5%</div>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <div className="text-[9px] text-slate-400">Transactions</div>
                          <div className="text-xs font-bold text-slate-900">248</div>
                          <div className="text-[8px] text-blue-600 font-medium">↑ +18.2%</div>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <div className="text-[9px] text-slate-400">Active Clients</div>
                          <div className="text-xs font-bold text-slate-900">142</div>
                          <div className="text-[8px] text-purple-600 font-medium">↑ +8.7%</div>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-slate-200">
                          <div className="text-[9px] text-slate-400">Pending</div>
                          <div className="text-xs font-bold text-slate-900">$2,320</div>
                          <div className="text-[8px] text-amber-600 font-medium">↑ +5.1%</div>
                        </div>
                      </div>

                      {/* Chart preview strip */}
                      <div className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400">Revenue Velocity</div>
                          <div className="text-sm font-extrabold text-[#174B38]">$12,750.00</div>
                        </div>
                        <div className="h-6 w-32 flex items-end gap-1">
                          <div className="w-2 bg-emerald-200 h-2 rounded-t" />
                          <div className="w-2 bg-emerald-300 h-3 rounded-t" />
                          <div className="w-2 bg-emerald-400 h-4 rounded-t" />
                          <div className="w-2 bg-emerald-500 h-5 rounded-t" />
                          <div className="w-2 bg-emerald-600 h-6 rounded-t" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Description */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Your Business, Supercharged with AI
                </h2>
                <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
                  Track payments, get insights, and let your AI assistant help you manage everything in one beautiful dashboard.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onExploreDashboard}
                    className="bg-white hover:bg-emerald-50 text-[#174B38] font-bold text-base px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Explore Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white border-t border-[#E8EAE5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#174B38] tracking-tight">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-[#55635B] mt-2">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Steps list */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[#174B38] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#174B38]">
                  Connect PayPal
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Link your PayPal account securely via Sandbox developer keys.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#174B38]">
                  Activate AI Agent
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Let AI extract payment details from your natural language requests.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[#287052] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#174B38]">
                  Grow Your Business
                </h3>
                <p className="text-sm text-[#55635B] leading-relaxed">
                  Focus on what matters — we'll handle invoicing and automated collection.
                </p>
              </div>
            </div>

            {/* Right Entrepreneur Photography */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden shadow-xl border-4 border-[#FAF9F5]">
                <img
                  src="/src/assets/images/how_it_works_artisan_owner_1794391939039.jpg"
                  alt="Modern creative entrepreneur managing business orders on laptop"
                  className="w-full h-full object-cover aspect-[4/3]"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Floating pill: Business Growth +245% */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-[#CCE2D2] flex items-center gap-2">
                  <div className="text-xs font-bold text-[#174B38]">
                    Business Growth
                  </div>
                  <span className="text-xs font-extrabold text-[#10B981]">
                    +245% ↑
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Ready to revolutionize banner */}
      <section className="py-12 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#174B38] rounded-2xl px-6 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#287052] flex items-center justify-center shrink-0">
                <Rocket className="w-6 h-6 text-[#A7F3D0]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Ready to revolutionize your payments with AI?
                </h3>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                  Join thousands of creators, freelancers, and businesses using PayPilot AI.
                </p>
              </div>
            </div>

            <button
              onClick={onGetStarted}
              className="bg-[#A7F3D0] hover:bg-[#86efac] text-[#064E3B] font-bold text-sm sm:text-base px-6 py-3 rounded-full shadow transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto bg-white border-t border-[#E8EAE5] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <BrandLogo size="md" />
              <p className="text-sm text-[#55635B] max-w-sm leading-relaxed">
                Your AI Payment Agent. From Conversation to Completed Payment. Certified for PayPal Developer Hackathon.
              </p>
              <div className="flex items-center gap-3 text-xs text-[#78847D]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Google Gemini API • PayPal Sandbox v2 Orders</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#174B38] mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-[#55635B]">
                <li>
                  <button onClick={onExploreDashboard} className="hover:text-[#174B38]">
                    AI Payment Agent
                  </button>
                </li>
                <li>
                  <button onClick={onExploreDashboard} className="hover:text-[#174B38]">
                    PayPal Checkout
                  </button>
                </li>
                <li>
                  <button onClick={onExploreDashboard} className="hover:text-[#174B38]">
                    Revenue Insights
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#174B38] mb-3">
                Resources
              </h4>
              <ul className="space-y-2 text-sm text-[#55635B]">
                <li>
                  <a href="#how-it-works" className="hover:text-[#174B38]">
                    How It Works
                  </a>
                </li>
                <li>
                  <button onClick={onExploreDashboard} className="hover:text-[#174B38]">
                    Documentation
                  </button>
                </li>
                <li>
                  <button onClick={onExploreDashboard} className="hover:text-[#174B38]">
                    Sandbox Testing Guide
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#174B38] mb-3">
                Account
              </h4>
              <ul className="space-y-2 text-sm text-[#55635B]">
                <li>
                  <button onClick={onSignIn} className="hover:text-[#174B38]">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={onGetStarted} className="hover:text-[#174B38]">
                    Register Account
                  </button>
                </li>
                <li>
                  <button onClick={onExploreDashboard} className="hover:text-[#174B38]">
                    Live Dashboard
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#E8EAE5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78847D] gap-4">
            <div>
              © 2026 PayPilot AI. Built for the PayPal & AI Hackathon.
            </div>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative border border-[#CCE2D2]">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F1E9] text-[#174B38] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                Interactive Video Walkthrough
              </div>
              <h3 className="text-2xl font-bold text-[#174B38]">
                PayPilot AI Workflow Demonstration
              </h3>
              <p className="text-sm text-[#55635B] leading-relaxed">
                Watch how PayPilot turns a natural language sentence into a verified PayPal Sandbox checkout order in seconds.
              </p>

              {/* Video Mockup / Walkthrough Canvas */}
              <div className="bg-[#174B38] text-white p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-[#174B38] font-bold">
                    ✓
                  </div>
                  <div className="text-sm font-semibold">
                    1. Prompt: "Create a payment request for Alex for $450 due in 7 days"
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-[#174B38] font-bold">
                    ✓
                  </div>
                  <div className="text-sm font-semibold">
                    2. Gemini 3.8 extracts structured line items & calculates totals
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-[#174B38] font-bold">
                    ✓
                  </div>
                  <div className="text-sm font-semibold">
                    3. PayPal Sandbox creates order and generates secure payment URL
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-[#174B38] font-bold">
                    ✓
                  </div>
                  <div className="text-sm font-semibold">
                    4. Customer approves checkout and server captures verified funds
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDemoModal(false);
                    onExploreDashboard();
                  }}
                  className="bg-[#174B38] hover:bg-[#11382A] text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow"
                >
                  Try It Live Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
