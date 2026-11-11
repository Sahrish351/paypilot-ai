import React, { useState, useEffect } from 'react';
import { ViewMode, UserProfile, DashboardStats, TransactionItem, PaymentRequestItem, ClientItem } from './types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TopHeader } from './components/TopHeader.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { AIAgentPage } from './components/AIAgentPage.tsx';
import { PaymentRequestsPage } from './components/PaymentRequestsPage.tsx';
import { TransactionsPage } from './components/TransactionsPage.tsx';
import { ClientsPage } from './components/ClientsPage.tsx';
import { AIInsightsPage } from './components/AIInsightsPage.tsx';
import { FollowUpsPage } from './components/FollowUpsPage.tsx';
import { ReportsPage } from './components/ReportsPage.tsx';
import { AutomationPage } from './components/AutomationPage.tsx';
import { SettingsPage } from './components/SettingsPage.tsx';
import { PublicCheckoutPage } from './components/PublicCheckoutPage.tsx';
import { CreatePaymentModal } from './components/CreatePaymentModal.tsx';
import { AuthModal } from './components/AuthModals.tsx';

export default function App() {
  // Check if browser loaded on /pay/:token
  const initialPath = window.location.pathname;
  const isPayRoute = initialPath.startsWith('/pay/');
  const payToken = isPayRoute ? initialPath.replace('/pay/', '') : '';

  const [currentView, setCurrentView] = useState<ViewMode>(isPayRoute ? 'public-checkout' : 'landing');
  const [activeCheckoutToken, setActiveCheckoutToken] = useState<string>(payToken || 'demo_token_alex_450');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; type: 'login' | 'register' | 'onboarding' }>({
    isOpen: false,
    type: 'login',
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_john_doe_01',
    name: 'John Doe',
    email: 'john@example.com',
    businessName: 'Apex Design & AI Systems',
    businessType: 'Agency',
    businessDescription: 'Full-stack AI solutions and custom web development for startups.',
    defaultCurrency: 'USD',
    avatarUrl: '/src/assets/images/avatar_john_doe_1794391937937.jpg',
  });

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 12750.00,
    revenueChange: '+12.5%',
    totalTransactions: 248,
    transactionsChange: '+18.2%',
    activeClients: 142,
    clientsChange: '+8.7%',
    pendingPayments: 2320.00,
    pendingChange: '+5.1%',
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequestItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedRequestForFollowUp, setSelectedRequestForFollowUp] = useState<PaymentRequestItem | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Initial data loading from server
  const refreshData = async () => {
    try {
      const [statsRes, txnsRes, reqsRes, clientsRes, meRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/payments'),
        fetch('/api/payment-requests'),
        fetch('/api/clients'),
        fetch('/api/auth/me'),
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
      if (txnsRes.ok) {
        const t = await txnsRes.json();
        setTransactions(t.transactions || []);
      }
      if (reqsRes.ok) {
        const r = await reqsRes.json();
        setPaymentRequests(r.requests || []);
      }
      if (clientsRes.ok) {
        const c = await clientsRes.json();
        setClients(c.clients || []);
      }
      if (meRes.ok) {
        const m = await meRes.json();
        if (m.user) setUser(m.user);
      }
    } catch (e) {
      console.warn('[App] Error refreshing server data:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update window URL for seamless customer checkout shareability
  const openCheckoutPage = (token: string) => {
    setActiveCheckoutToken(token);
    setCurrentView('public-checkout');
    window.history.pushState({}, '', `/pay/${token}`);
  };

  const handleReturnFromCheckout = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('dashboard');
    refreshData();
  };

  const handleSendWidgetChatMessage = async (msg: string) => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    return data;
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const d = await res.json();
      setUser(d.user);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E2924] font-sans antialiased selection:bg-[#E7F1E9] selection:text-[#174B38]">
      {/* 1. Public Customer Checkout View */}
      {currentView === 'public-checkout' ? (
        <PublicCheckoutPage
          token={activeCheckoutToken}
          onReturnToDashboard={handleReturnFromCheckout}
        />
      ) : currentView === 'landing' ? (
        /* 2. Public Landing Page matching reference screenshot */
        <LandingPage
          onGetStarted={() => {
            setAuthModalState({ isOpen: true, type: 'register' });
          }}
          onSignIn={() => {
            setAuthModalState({ isOpen: true, type: 'login' });
          }}
          onExploreDashboard={() => {
            setCurrentView('dashboard');
          }}
        />
      ) : (
        /* 3. Authenticated SaaS Workspace (Dashboard, AI Agent, Invoicing, etc.) */
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block">
            <Sidebar
              currentView={currentView}
              onNavigate={view => {
                setCurrentView(view);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSignOut={() => {
                setCurrentView('landing');
              }}
              userName={user.name}
              userEmail={user.email}
              avatarUrl={user.avatarUrl}
            />
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-2xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative z-10 w-64 bg-[#0E382A] h-full shadow-2xl">
                <Sidebar
                  currentView={currentView}
                  onNavigate={view => {
                    setCurrentView(view);
                    setMobileMenuOpen(false);
                  }}
                  onSignOut={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('landing');
                  }}
                  userName={user.name}
                  userEmail={user.email}
                  avatarUrl={user.avatarUrl}
                />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Top Navigation Bar */}
            <TopHeader
              onOpenCreatePayment={() => setShowCreatePaymentModal(true)}
              onOpenAI={() => setCurrentView('ai-agent')}
              avatarUrl={user.avatarUrl}
              userName={user.name}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />

            {/* View Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {currentView === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  transactions={transactions}
                  paymentRequests={paymentRequests}
                  onNavigateToAI={(prompt) => {
                    if (prompt) setAiInitialPrompt(prompt);
                    setCurrentView('ai-agent');
                  }}
                  onNavigateToPayments={() => setCurrentView('payments')}
                  onNavigateToTransactions={() => setCurrentView('transactions')}
                  onNavigateToAnalytics={() => setCurrentView('analytics')}
                  onSelectTransaction={() => setCurrentView('transactions')}
                  onOpenCreatePayment={() => setShowCreatePaymentModal(true)}
                  onSendChatMessage={handleSendWidgetChatMessage}
                />
              )}

              {currentView === 'ai-agent' && (
                <AIAgentPage
                  initialPrompt={aiInitialPrompt}
                  onOpenCheckout={openCheckoutPage}
                  onPaymentCreated={req => {
                    setPaymentRequests(prev => [req, ...prev]);
                    refreshData();
                  }}
                />
              )}

              {currentView === 'payments' && (
                <PaymentRequestsPage
                  requests={paymentRequests}
                  onOpenCreateModal={() => setShowCreatePaymentModal(true)}
                  onOpenCheckout={openCheckoutPage}
                  onOpenFollowUp={req => {
                    setSelectedRequestForFollowUp(req);
                    setCurrentView('analytics'); // or follow-up
                  }}
                  onRefresh={refreshData}
                />
              )}

              {currentView === 'transactions' && (
                <TransactionsPage
                  transactions={transactions}
                  onOpenReportExport={() => setCurrentView('reports')}
                />
              )}

              {currentView === 'clients' && (
                <ClientsPage
                  clients={clients}
                  onRefresh={refreshData}
                  onSelectClientForPayment={c => {
                    setShowCreatePaymentModal(true);
                  }}
                />
              )}

              {currentView === 'analytics' && (
                <AIInsightsPage
                  stats={stats}
                  transactions={transactions}
                  onOpenFollowUps={() => setCurrentView('automation')}
                />
              )}

              {currentView === 'reports' && (
                <ReportsPage transactions={transactions} />
              )}

              {currentView === 'automation' && (
                <AutomationPage />
              )}

              {currentView === 'settings' && (
                <SettingsPage
                  user={user}
                  onUpdateUser={handleUpdateProfile}
                  onSignOut={() => setCurrentView('landing')}
                />
              )}

              {currentView === 'help' && (
                <div className="bg-white p-8 rounded-3xl border border-[#E8EAE5] shadow-xs space-y-4 max-w-2xl">
                  <h1 className="text-xl font-bold text-slate-900">
                    PayPilot AI Documentation & Support
                  </h1>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    PayPilot AI connects the Gemini 3.8 Flash model with the PayPal Orders API v2.
                    To test payments, create a payment link and open it in a private window to simulate customer checkout using PayPal Sandbox test accounts.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentView('ai-agent')}
                      className="bg-[#174B38] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                    >
                      Ask AI Assistant
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      <CreatePaymentModal
        isOpen={showCreatePaymentModal}
        onClose={() => setShowCreatePaymentModal(false)}
        onCreated={req => {
          setPaymentRequests(prev => [req, ...prev]);
          refreshData();
        }}
      />

      {/* Auth Modal (Login / Register / Onboarding) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        type={authModalState.type}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onSuccess={userData => {
          if (userData) {
            setUser(prev => ({ ...prev, ...userData }));
          }
          setAuthModalState({ ...authModalState, isOpen: false });
          setCurrentView('dashboard');
          refreshData();
        }}
        onSwitchType={type => setAuthModalState({ isOpen: true, type })}
      />
    </div>
  );
}
