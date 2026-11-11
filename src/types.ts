export type PaymentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'OVERDUE';

export interface NotificationPreferences {
  emailReceipts: boolean;
  overdueReminders: boolean;
  aiInsightsDigest: boolean;
  paymentAlerts: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
  defaultCurrency: string;
  onboardingCompleted?: boolean;
  isDemoAccount?: boolean;
  notificationPreferences?: NotificationPreferences;
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
  createdAt?: string;
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
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  title: string;
  description: string;
  lineItems: LineItem[];
  subtotal: number;
  totalAmount: number;
  currency: string;
  dueDate: string;
  status: PaymentStatus;
  publicToken: string;
  paypalOrderId?: string;
  notes?: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  paymentRequestId?: string;
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
  environment?: 'sandbox';
  createdAt: string;
  capturedAt: string;
}

export interface PaymentProposal {
  client_name: string;
  client_email?: string;
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency: string;
  due_date: string;
  total_amount: number;
  missing_fields?: string[];
  clarification_questions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  aiMode?: 'gemini-live' | 'heuristic-fallback';
  proposal?: PaymentProposal;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTransactions: number;
  activeClients: number;
  pendingPayments: number;
  completedRequests: number;
  overdueRequests: number;
  isDemoData?: boolean;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'system' | 'ai';
  read: boolean;
  createdAt: string;
}
