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

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  businessName: string;
  businessType: 'Freelancer' | 'Agency' | 'Small business' | 'Consultant' | 'Other';
  businessDescription: string;
  defaultCurrency: string;
  onboardingCompleted: boolean;
  notificationPreferences?: NotificationPreferences;
  isDemoAccount?: boolean;
  avatarUrl?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  company: string;
  notes?: string;
  totalRequests: number;
  totalPaid: number;
  pendingAmount: number;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  ownerId: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  requestNumber: string;
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
  updatedAt: string;
}

export interface Transaction {
  id: string;
  ownerId: string;
  paymentRequestId: string;
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

export interface PaymentProposalPayload {
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

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  aiMode?: 'gemini-live' | 'heuristic-fallback';
  proposal?: PaymentProposalPayload;
}

export interface NotificationItem {
  id: string;
  ownerId: string;
  title: string;
  message: string;
  type: 'payment' | 'system' | 'ai';
  read: boolean;
  createdAt: string;
}
