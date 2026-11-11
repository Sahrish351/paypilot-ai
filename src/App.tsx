import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ui/ProtectedRoute.tsx';
import { AppShell } from './components/layout/AppShell.tsx';
import { CreatePaymentModal } from './components/CreatePaymentModal.tsx';
import { ClientItem } from './types.ts';

// Public Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { FeaturesPage } from './pages/FeaturesPage.tsx';
import { HowItWorksPage } from './pages/HowItWorksPage.tsx';
import { PublicCheckoutPage } from './pages/PublicCheckoutPage.tsx';

// Auth & Onboarding Pages
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';

// Authenticated Workspace Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AIAgentPage } from './pages/AIAgentPage.tsx';
import { PaymentsPage } from './pages/PaymentsPage.tsx';
import { TransactionsPage } from './pages/TransactionsPage.tsx';
import { ClientsPage } from './pages/ClientsPage.tsx';
import { InsightsPage } from './pages/InsightsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [prefillClient, setPrefillClient] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });
  const [refreshSignal, setRefreshSignal] = useState(0);

  const triggerRefresh = () => setRefreshSignal(s => s + 1);

  const openCreateModal = (client?: ClientItem) => {
    setPrefillClient({
      name: client?.name || '',
      email: client?.email || '',
    });
    setCreateModalOpen(true);
  };

  const withShell = (element: React.ReactNode) => (
    <ProtectedRoute>
      <AppShell onOpenCreatePayment={() => openCreateModal()}>{element}</AppShell>
    </ProtectedRoute>
  );

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Marketing & Product Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pay/:token" element={<PublicCheckoutPage />} />

        {/* Authentication & Onboarding */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Authenticated Application Pages */}
        <Route
          path="/dashboard"
          element={withShell(
            <DashboardPage
              onOpenCreatePayment={() => openCreateModal()}
              refreshSignal={refreshSignal}
            />
          )}
        />
        <Route
          path="/ai-agent"
          element={withShell(<AIAgentPage onPaymentCreated={triggerRefresh} />)}
        />
        <Route
          path="/payments"
          element={withShell(
            <PaymentsPage
              onOpenCreatePayment={() => openCreateModal()}
              refreshSignal={refreshSignal}
            />
          )}
        />
        <Route path="/transactions" element={withShell(<TransactionsPage />)} />
        <Route
          path="/clients"
          element={withShell(
            <ClientsPage
              onCreatePaymentForClient={c => openCreateModal(c)}
              refreshSignal={refreshSignal}
            />
          )}
        />
        <Route path="/insights" element={withShell(<InsightsPage />)} />
        <Route path="/reports" element={withShell(<ReportsPage />)} />
        <Route path="/settings" element={withShell(<SettingsPage />)} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CreatePaymentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={triggerRefresh}
        prefillClientName={prefillClient.name}
        prefillClientEmail={prefillClient.email}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
