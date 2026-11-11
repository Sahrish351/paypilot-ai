export type ViewMode =
  | 'landing'
  | 'dashboard'
  | 'ai-agent'
  | 'payments'
  | 'transactions'
  | 'clients'
  | 'analytics'
  | 'reports'
  | 'automation'
  | 'settings'
  | 'help'
  | 'public-checkout';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
  defaultCurrency: string;
  avatarUrl?: string;
}

export interface ClientItem {
  id: string;
  name: string;
  email: string;
  company: string;
  notes?: string;
  totalRequests: number;
  totalPaid: number;
  pendingAmount: number;
  lastPaymentDate?: string;
}

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PaymentRequestItem {
  id: string;
  requestNumber: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  subtotal: number;
  totalAmount: number;
  currency: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'OVERDUE';
  publicToken: string;
  paypalOrderId?: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  paypalOrderId: string;
  paypalCaptureId: string;
  clientName: string;
  clientEmail?: string;
  description: string;
  amount: number;
  currency: string;
  status: 'Completed' | 'Refunded' | 'Pending' | 'Failed';
  type: 'Payment' | 'Refund' | 'Invoice';
  captureReference?: string;
  createdAt: string;
  capturedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  proposal?: {
    client_name: string;
    client_email?: string;
    service_name: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency: string;
    due_date: string;
    total_amount: number;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: string;
  totalTransactions: number;
  transactionsChange: string;
  activeClients: number;
  clientsChange: string;
  pendingPayments: number;
  pendingChange: string;
}
