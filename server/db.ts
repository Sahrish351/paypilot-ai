import fs from 'fs';
import path from 'path';
import { User, Client, PaymentRequest, Transaction, AIChatMessage, NotificationItem } from './types.ts';
import { hashPassword } from './utils/crypto.ts';

interface DatabaseSchema {
  users: User[];
  clients: Client[];
  paymentRequests: PaymentRequest[];
  transactions: Transaction[];
  chatHistory: Record<string, AIChatMessage[]>;
  notifications: NotificationItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = process.env.PAYPILOT_DB_FILE
  ? path.resolve(process.env.PAYPILOT_DB_FILE)
  : path.join(DATA_DIR, 'store.json');

function getInitialData(): DatabaseSchema {
  const defaultOwnerId = 'usr_john_doe_01';

  const defaultUser: User = {
    id: defaultOwnerId,
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash: hashPassword('demo1234'),
    businessName: 'Apex Design & AI Systems',
    businessType: 'Agency',
    businessDescription: 'Full-stack AI solutions and custom web development for startups.',
    defaultCurrency: 'USD',
    onboardingCompleted: true,
    isDemoAccount: true,
    notificationPreferences: {
      emailReceipts: true,
      overdueReminders: true,
      aiInsightsDigest: true,
      paymentAlerts: true,
    },
    avatarUrl: '/src/assets/images/avatar_john_doe_1794391937937.jpg',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-04-30T10:00:00.000Z',
  };

  const clients: Client[] = [
    {
      id: 'cli_alex_morgan',
      ownerId: defaultOwnerId,
      name: 'Alex Morgan',
      email: 'alex@northstardigital.io',
      company: 'Northstar Digital',
      notes: 'Key enterprise web design client. Net-15 payment terms.',
      totalRequests: 4,
      totalPaid: 4500,
      pendingAmount: 450,
      lastPaymentDate: '2025-04-30T14:22:00.000Z',
      createdAt: '2025-02-01T10:00:00.000Z',
      updatedAt: '2025-04-30T14:22:00.000Z',
    },
    {
      id: 'cli_sarah_chen',
      ownerId: defaultOwnerId,
      name: 'Sarah Chen',
      email: 'sarah@luminahealth.com',
      company: 'Lumina Health',
      notes: 'Medical telehealth portal UX & frontend engineering.',
      totalRequests: 3,
      totalPaid: 3350,
      pendingAmount: 850,
      lastPaymentDate: '2025-04-29T11:15:00.000Z',
      createdAt: '2025-02-14T09:30:00.000Z',
      updatedAt: '2025-04-29T11:15:00.000Z',
    },
    {
      id: 'cli_marcus_vance',
      ownerId: defaultOwnerId,
      name: 'Marcus Vance',
      email: 'marcus@vancecapital.co',
      company: 'Vance Capital',
      notes: 'Fintech automated billing integration.',
      totalRequests: 5,
      totalPaid: 4900,
      pendingAmount: 1020,
      lastPaymentDate: '2025-04-27T16:45:00.000Z',
      createdAt: '2025-01-20T12:00:00.000Z',
      updatedAt: '2025-04-27T16:45:00.000Z',
    },
    {
      id: 'cli_elena_rostova',
      ownerId: defaultOwnerId,
      name: 'Elena Rostova',
      email: 'elena@solardynamics.de',
      company: 'Solar Dynamics GmbH',
      notes: 'Renewable energy dashboard frontend modules.',
      totalRequests: 2,
      totalPaid: 2120,
      pendingAmount: 0,
      lastPaymentDate: '2025-04-24T09:10:00.000Z',
      createdAt: '2025-03-05T08:00:00.000Z',
      updatedAt: '2025-04-24T09:10:00.000Z',
    },
  ];

  const paymentRequests: PaymentRequest[] = [
    {
      id: 'pr_1045_website',
      ownerId: defaultOwnerId,
      clientId: 'cli_alex_morgan',
      clientName: 'Alex Morgan',
      clientEmail: 'alex@northstardigital.io',
      requestNumber: 'REQ-1045',
      title: 'Business Website Final Milestone',
      description: 'Completion of 5-page responsive corporate website, CMS integration, and SEO optimization.',
      lineItems: [
        {
          id: 'li_1',
          name: 'Business Website Frontend & CMS',
          description: 'Responsive web templates with Tailwind CSS and React',
          quantity: 1,
          unitPrice: 450,
          lineTotal: 450,
        },
      ],
      subtotal: 450,
      totalAmount: 450,
      currency: 'USD',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      publicToken: 'demo_token_alex_450',
      createdAt: '2025-04-30T10:15:00.000Z',
      updatedAt: '2025-04-30T10:15:00.000Z',
    },
    {
      id: 'pr_1044_consulting',
      ownerId: defaultOwnerId,
      clientId: 'cli_sarah_chen',
      clientName: 'Sarah Chen',
      clientEmail: 'sarah@luminahealth.com',
      requestNumber: 'REQ-1044',
      title: 'UX Design System Sprint',
      description: 'Design system documentation, component tokens, and interactive Figma library handoff.',
      lineItems: [
        {
          id: 'li_2',
          name: 'Design System & Accessibility Audit',
          description: 'WCAG 2.1 AA compliant component specs and documentation',
          quantity: 1,
          unitPrice: 850,
          lineTotal: 850,
        },
      ],
      subtotal: 850,
      totalAmount: 850,
      currency: 'USD',
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: 'PENDING',
      publicToken: 'demo_token_sarah_850',
      createdAt: '2025-04-29T16:00:00.000Z',
      updatedAt: '2025-04-29T16:00:00.000Z',
    },
    {
      id: 'pr_1043_ai_agent',
      ownerId: defaultOwnerId,
      clientId: 'cli_marcus_vance',
      clientName: 'Marcus Vance',
      clientEmail: 'marcus@vancecapital.co',
      requestNumber: 'REQ-1043',
      title: 'Automated Billing Agent Implementation',
      description: 'PayPal API v2 Orders integration and automated recurring webhook listener.',
      lineItems: [
        {
          id: 'li_3',
          name: 'PayPal Sandbox & Orders API v2 Setup',
          description: 'Secure server-side order capture and client checkout SDK integration',
          quantity: 1,
          unitPrice: 1020,
          lineTotal: 1020,
        },
      ],
      subtotal: 1020,
      totalAmount: 1020,
      currency: 'USD',
      dueDate: '2025-04-20', // intentionally overdue demo item
      status: 'PENDING',
      publicToken: 'demo_token_marcus_1020',
      createdAt: '2025-04-12T14:00:00.000Z',
      updatedAt: '2025-04-12T14:00:00.000Z',
    },
    {
      id: 'pr_1042_client_payment',
      ownerId: defaultOwnerId,
      clientId: 'cli_alex_morgan',
      clientName: 'Alex Morgan',
      clientEmail: 'alex@northstardigital.io',
      requestNumber: 'REQ-1042',
      title: 'Q1 Digital Strategy & Frontend Review',
      description: 'Quarterly web review and performance tuning.',
      lineItems: [
        {
          id: 'li_4',
          name: 'Strategy & Tuning Session',
          description: 'Comprehensive lighthouse score optimization and caching strategy',
          quantity: 1,
          unitPrice: 1250,
          lineTotal: 1250,
        },
      ],
      subtotal: 1250,
      totalAmount: 1250,
      currency: 'USD',
      dueDate: '2025-04-30',
      status: 'COMPLETED',
      publicToken: 'paid_alex_1250',
      paypalOrderId: 'PAYPAL-ORD-889923',
      createdAt: '2025-04-25T11:00:00.000Z',
      updatedAt: '2025-04-30T09:30:00.000Z',
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'txn_001_apr30',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_1042_client_payment',
      paypalOrderId: '8W1029384756',
      paypalCaptureId: 'CAP-9988771122',
      clientName: 'Alex Morgan',
      clientEmail: 'alex@northstardigital.io',
      description: 'Q1 Digital Strategy & Frontend Review',
      amount: 1250.0,
      currency: 'USD',
      status: 'Completed',
      type: 'Payment',
      captureReference: 'DEMO_SANDBOX_ORD_8W1029',
      environment: 'sandbox',
      createdAt: '2025-04-30T09:30:00.000Z',
      capturedAt: '2025-04-30T09:30:15.000Z',
    },
    {
      id: 'txn_002_apr29',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_old_1042',
      paypalOrderId: '5T8829103948',
      paypalCaptureId: 'CAP-4433221100',
      clientName: 'Sarah Chen',
      clientEmail: 'sarah@luminahealth.com',
      description: 'Invoice #1042 — UX Audit',
      amount: 850.0,
      currency: 'USD',
      status: 'Completed',
      type: 'Invoice',
      captureReference: 'DEMO_SANDBOX_ORD_5T8829',
      environment: 'sandbox',
      createdAt: '2025-04-29T14:15:00.000Z',
      capturedAt: '2025-04-29T14:15:30.000Z',
    },
    {
      id: 'txn_003_apr28',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_refund_001',
      paypalOrderId: 'REF-3392019482',
      paypalCaptureId: 'CAP-REF-992211',
      clientName: 'Marcus Vance',
      clientEmail: 'marcus@vancecapital.co',
      description: 'Scope Adjustment Refund',
      amount: -120.0,
      currency: 'USD',
      status: 'Refunded',
      type: 'Refund',
      captureReference: 'DEMO_SANDBOX_REF_3392',
      environment: 'sandbox',
      createdAt: '2025-04-28T16:20:00.000Z',
      capturedAt: '2025-04-28T16:20:45.000Z',
    },
    {
      id: 'txn_004_apr27',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_old_1040',
      paypalOrderId: '9P4477221100',
      paypalCaptureId: 'CAP-5566778899',
      clientName: 'Marcus Vance',
      clientEmail: 'marcus@vancecapital.co',
      description: 'Billing API Architecture Milestone',
      amount: 2500.0,
      currency: 'USD',
      status: 'Completed',
      type: 'Payment',
      captureReference: 'DEMO_SANDBOX_ORD_9P4477',
      environment: 'sandbox',
      createdAt: '2025-04-27T11:00:00.000Z',
      capturedAt: '2025-04-27T11:00:22.000Z',
    },
    {
      id: 'txn_005_apr24',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_old_1039',
      paypalOrderId: '7K1199338822',
      paypalCaptureId: 'CAP-1122334455',
      clientName: 'Elena Rostova',
      clientEmail: 'elena@solardynamics.de',
      description: 'Solar Dashboard Phase 1',
      amount: 2120.0,
      currency: 'USD',
      status: 'Completed',
      type: 'Payment',
      captureReference: 'DEMO_SANDBOX_ORD_7K1199',
      environment: 'sandbox',
      createdAt: '2025-04-24T09:10:00.000Z',
      capturedAt: '2025-04-24T09:10:45.000Z',
    },
    {
      id: 'txn_006_apr20',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_old_1038',
      paypalOrderId: '4M3388229911',
      paypalCaptureId: 'CAP-9900112233',
      clientName: 'Alex Morgan',
      clientEmail: 'alex@northstardigital.io',
      description: 'Brand Assets & Guidelines',
      amount: 3250.0,
      currency: 'USD',
      status: 'Completed',
      type: 'Payment',
      captureReference: 'DEMO_SANDBOX_ORD_4M3388',
      environment: 'sandbox',
      createdAt: '2025-04-20T15:30:00.000Z',
      capturedAt: '2025-04-20T15:30:19.000Z',
    },
    {
      id: 'txn_007_apr15',
      ownerId: defaultOwnerId,
      paymentRequestId: 'pr_old_1037',
      paypalOrderId: '2L7744110099',
      paypalCaptureId: 'CAP-8877665544',
      clientName: 'Sarah Chen',
      clientEmail: 'sarah@luminahealth.com',
      description: 'Telehealth Portal Kickoff',
      amount: 2900.0,
      currency: 'USD',
      status: 'Completed',
      type: 'Payment',
      captureReference: 'DEMO_SANDBOX_ORD_2L7744',
      environment: 'sandbox',
      createdAt: '2025-04-15T10:00:00.000Z',
      capturedAt: '2025-04-15T10:00:30.000Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      ownerId: defaultOwnerId,
      title: 'Demo Sandbox Payment',
      message: 'Alex Morgan completed demo payment of $1,250.00 via PayPal Sandbox.',
      type: 'payment',
      read: false,
      createdAt: '2025-04-30T09:31:00.000Z',
    },
    {
      id: 'notif_2',
      ownerId: defaultOwnerId,
      title: 'AI Proposal Ready',
      message: 'AI prepared payment proposal for Business Website Final Milestone.',
      type: 'ai',
      read: true,
      createdAt: '2025-04-30T10:16:00.000Z',
    },
  ];

  return {
    users: [defaultUser],
    clients,
    paymentRequests,
    transactions,
    chatHistory: {
      [defaultOwnerId]: [
        {
          id: 'msg_welcome',
          role: 'assistant',
          content:
            "Hello! I'm your PayPilot AI Payment Agent. Describe any payment request in plain English—like \"Create a payment request for John for $250 for website development due next Friday\"—and I'll extract the structured proposal for your review before creating a PayPal Sandbox link.",
          timestamp: new Date().toISOString(),
        },
      ],
    },
    notifications,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Ensure demo user is tagged properly
        const demo = parsed.users?.find(u => u.id === 'usr_john_doe_01');
        if (demo && demo.isDemoAccount === undefined) {
          demo.isDemoAccount = true;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('[DB] Failed reading db file, re-initializing defaults:', e);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Failed saving database:', e);
    }
  }

  // User operations
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  findUserByResetToken(token: string): User | undefined {
    return this.data.users.find(u => u.passwordResetToken === token);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.data.chatHistory[user.id] = [
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content:
          "Welcome to PayPilot AI! Tell me who you'd like to bill, the amount, and the service description—I'll prepare a structured payment proposal for your approval.",
        timestamp: new Date().toISOString(),
      },
    ];
    this.data.notifications.unshift({
      id: `notif_welcome_${Date.now()}`,
      ownerId: user.id,
      title: 'Welcome to PayPilot AI',
      message: 'Your workspace is ready. Try creating your first payment request with the AI Payment Agent.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  // Clients
  getClients(ownerId: string): Client[] {
    return this.data.clients.filter(c => c.ownerId === ownerId);
  }

  getClientById(id: string, ownerId: string): Client | undefined {
    return this.data.clients.find(c => c.id === id && c.ownerId === ownerId);
  }

  createClient(client: Client): Client {
    this.data.clients.unshift(client);
    this.save();
    return client;
  }

  updateClient(id: string, ownerId: string, updates: Partial<Client>): Client | undefined {
    const idx = this.data.clients.findIndex(c => c.id === id && c.ownerId === ownerId);
    if (idx === -1) return undefined;
    const { id: _id, ownerId: _owner, ...safeUpdates } = updates;
    this.data.clients[idx] = { ...this.data.clients[idx], ...safeUpdates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.clients[idx];
  }

  deleteClient(id: string, ownerId: string): boolean {
    const hasRequests = this.data.paymentRequests.some(
      r => r.clientId === id && r.ownerId === ownerId && r.status !== 'CANCELLED'
    );
    if (hasRequests) return false;
    const initialLen = this.data.clients.length;
    this.data.clients = this.data.clients.filter(c => !(c.id === id && c.ownerId === ownerId));
    if (this.data.clients.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Payment Requests (auto-computes OVERDUE display status when past dueDate)
  private normalizeRequestStatus(req: PaymentRequest): PaymentRequest {
    if (req.status === 'PENDING' && req.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      if (req.dueDate < today) {
        return { ...req, status: 'OVERDUE' };
      }
    }
    return req;
  }

  getPaymentRequests(ownerId: string): PaymentRequest[] {
    return this.data.paymentRequests
      .filter(r => r.ownerId === ownerId)
      .map(r => this.normalizeRequestStatus(r));
  }

  getPaymentRequestById(id: string, ownerId: string): PaymentRequest | undefined {
    const found = this.data.paymentRequests.find(r => r.id === id && r.ownerId === ownerId);
    return found ? this.normalizeRequestStatus(found) : undefined;
  }

  getPaymentRequestByPublicToken(token: string): PaymentRequest | undefined {
    const found = this.data.paymentRequests.find(r => r.publicToken === token);
    return found ? this.normalizeRequestStatus(found) : undefined;
  }

  getPaymentRequestByOrderId(paypalOrderId: string): PaymentRequest | undefined {
    const found = this.data.paymentRequests.find(r => r.paypalOrderId === paypalOrderId);
    return found ? this.normalizeRequestStatus(found) : undefined;
  }

  createPaymentRequest(req: PaymentRequest): PaymentRequest {
    this.data.paymentRequests.unshift(req);
    if (req.clientId) {
      const client = this.data.clients.find(c => c.id === req.clientId && c.ownerId === req.ownerId);
      if (client) {
        client.totalRequests += 1;
        if (req.status !== 'DRAFT' && req.status !== 'CANCELLED') {
          client.pendingAmount += req.totalAmount;
        }
        client.updatedAt = new Date().toISOString();
      }
    }
    this.save();
    return this.normalizeRequestStatus(req);
  }

  updatePaymentRequest(id: string, ownerId: string, updates: Partial<PaymentRequest>): PaymentRequest | undefined {
    const idx = this.data.paymentRequests.findIndex(r => r.id === id && r.ownerId === ownerId);
    if (idx === -1) return undefined;
    const { id: _id, ownerId: _owner, ...safeUpdates } = updates;
    this.data.paymentRequests[idx] = {
      ...this.data.paymentRequests[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.normalizeRequestStatus(this.data.paymentRequests[idx]);
  }

  cancelPaymentRequest(id: string, ownerId: string): PaymentRequest | undefined {
    const idx = this.data.paymentRequests.findIndex(r => r.id === id && r.ownerId === ownerId);
    if (idx === -1) return undefined;
    const req = this.data.paymentRequests[idx];
    if (req.status === 'COMPLETED') return undefined;

    if (req.status === 'PENDING' || req.status === 'OVERDUE' || req.status === 'APPROVED') {
      const client = this.data.clients.find(c => c.id === req.clientId && c.ownerId === ownerId);
      if (client) {
        client.pendingAmount = Math.max(0, client.pendingAmount - req.totalAmount);
      }
    }

    req.status = 'CANCELLED';
    req.updatedAt = new Date().toISOString();
    this.save();
    return req;
  }

  deletePaymentRequest(id: string, ownerId: string): boolean {
    const req = this.data.paymentRequests.find(r => r.id === id && r.ownerId === ownerId);
    if (!req || (req.status !== 'DRAFT' && req.status !== 'CANCELLED')) return false;
    this.data.paymentRequests = this.data.paymentRequests.filter(r => r.id !== id);
    this.save();
    return true;
  }

  // Transactions
  getTransactions(ownerId: string): Transaction[] {
    return this.data.transactions.filter(t => t.ownerId === ownerId);
  }

  getTransactionById(id: string, ownerId: string): Transaction | undefined {
    return this.data.transactions.find(t => t.id === id && t.ownerId === ownerId);
  }

  recordTransaction(txn: Transaction): Transaction {
    // Idempotency guard on captureId / paymentRequestId
    const existing = this.data.transactions.find(
      t =>
        (t.paypalCaptureId && t.paypalCaptureId === txn.paypalCaptureId) ||
        (t.paymentRequestId && t.paymentRequestId === txn.paymentRequestId && t.status === 'Completed')
    );
    if (existing) return existing;

    this.data.transactions.unshift(txn);
    if (txn.paymentRequestId) {
      const req = this.data.paymentRequests.find(r => r.id === txn.paymentRequestId);
      if (req) {
        req.status = 'COMPLETED';
        req.updatedAt = new Date().toISOString();
        if (req.clientId) {
          const client = this.data.clients.find(c => c.id === req.clientId);
          if (client) {
            client.totalPaid += txn.amount;
            client.pendingAmount = Math.max(0, client.pendingAmount - txn.amount);
            client.lastPaymentDate = txn.capturedAt;
          }
        }
      }
    }
    this.data.notifications.unshift({
      id: `notif_${Date.now()}`,
      ownerId: txn.ownerId,
      title: 'Payment Verified & Received',
      message: `${txn.clientName} completed payment of $${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${txn.currency} via PayPal Sandbox.`,
      type: 'payment',
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
    return txn;
  }

  // Chat History
  getChatHistory(ownerId: string): AIChatMessage[] {
    return this.data.chatHistory[ownerId] || [];
  }

  appendChatMessage(ownerId: string, message: AIChatMessage): AIChatMessage {
    if (!this.data.chatHistory[ownerId]) {
      this.data.chatHistory[ownerId] = [];
    }
    this.data.chatHistory[ownerId].push(message);
    this.save();
    return message;
  }

  clearChatHistory(ownerId: string): void {
    this.data.chatHistory[ownerId] = [
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content:
          "Conversation cleared. Tell me who you'd like to bill and for what service, and I'll build a structured payment proposal for your review.",
        timestamp: new Date().toISOString(),
      },
    ];
    this.save();
  }

  // Notifications
  getNotifications(ownerId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.ownerId === ownerId);
  }

  markNotificationAsRead(id: string, ownerId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.ownerId === ownerId);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(ownerId: string): void {
    for (const notif of this.data.notifications) {
      if (notif.ownerId === ownerId) notif.read = true;
    }
    this.save();
  }
}

export const db = new Database();
