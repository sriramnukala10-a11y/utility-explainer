import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  INITIAL_USERS,
  INITIAL_ADDRESSES,
  INITIAL_ACCOUNTS,
  INITIAL_BILLS,
  INITIAL_PAYMENTS,
  INITIAL_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ALERTS,
  MockUser,
  MockBill,
  MockPayment,
  MockServiceTicket,
  MockNotification,
  MockServiceAlert,
} from './seed-data';
import { PaymentStatus, TicketStatus, Role } from './types';
import { generateTicketNumber } from './ticket-manager';
import { generatePaymentReference, generateReceiptNumber } from './payment-gateway';

// Initialize Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Local Persistent Store Directory
const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'utility_store.json');

interface DataStoreSchema {
  users: MockUser[];
  addresses: typeof INITIAL_ADDRESSES;
  accounts: typeof INITIAL_ACCOUNTS;
  bills: MockBill[];
  payments: MockPayment[];
  tickets: MockServiceTicket[];
  notifications: MockNotification[];
  alerts: MockServiceAlert[];
  webhooks: Array<{ id: string; provider: string; eventType: string; payloadJson: string; createdAt: string }>;
  auditLogs: Array<{ id: string; userId?: string; userEmail?: string; action: string; entityType: string; entityId?: string; detailsJson?: string; ipAddress?: string; createdAt: string }>;
  consents: Array<{ id: string; userId?: string; analyticsConsent: boolean; functionalConsent: boolean; marketingConsent: boolean; updatedAt: string }>;
  ticketCounter: number;
}

function loadLocalStore(): DataStoreSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[DB Engine] Could not read local persistent store, reinitializing defaults:', err);
  }

  // Initialize with seed data
  const initialStore: DataStoreSchema = {
    users: [...INITIAL_USERS],
    addresses: [...INITIAL_ADDRESSES],
    accounts: [...INITIAL_ACCOUNTS],
    bills: [...INITIAL_BILLS],
    payments: [...INITIAL_PAYMENTS],
    tickets: [...INITIAL_TICKETS],
    notifications: [...INITIAL_NOTIFICATIONS],
    alerts: [...INITIAL_ALERTS],
    webhooks: [],
    auditLogs: [
      {
        id: 'audit_init_1',
        action: 'SYSTEM_BOOT',
        entityType: 'SYSTEM',
        detailsJson: JSON.stringify({ message: 'Utilities That Explain Themselves engine initialized' }),
        createdAt: new Date().toISOString(),
      },
    ],
    consents: [],
    ticketCounter: 104,
  };

  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
  } catch (writeErr) {
    console.error('[DB Engine] Error creating initial store file:', writeErr);
  }

  return initialStore;
}

function saveLocalStore(store: DataStoreSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${STORE_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORE_FILE);
  } catch (err) {
    console.error('[DB Engine] Error saving persistent store:', err);
  }
}

// Memory cache loaded from persistent file
let inMemoryStore = loadLocalStore();

export const db = {
  // --- USERS ---
  async findUserByEmail(email: string) {
    return inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string) {
    return inMemoryStore.users.find((u) => u.id === id) || null;
  },

  async createUser(userData: { email: string; name: string; passwordHash: string; phone?: string; role?: Role }) {
    const existing = await this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('A customer with this email address already exists');
    }
    const newUser: MockUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || '',
      role: userData.role || 'CUSTOMER',
      passwordHash: userData.passwordHash,
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.users.push(newUser);

    // Auto-create sample residential address and electricity/water utility account for demonstration
    const newAddressId = `addr_${Date.now()}`;
    inMemoryStore.addresses.push({
      id: newAddressId,
      userId: newUser.id,
      streetAddress: '104 Residency Road, Richmond Town',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560025',
      landmark: 'Near Utility Circle',
      isPrimary: true,
    });

    const elecAccNum = `ELEC-${Math.floor(100000 + Math.random() * 900000)}`;
    const watrAccNum = `WATR-${Math.floor(100000 + Math.random() * 900000)}`;

    inMemoryStore.accounts.push({
      id: `acc_${newUser.id}_elec`,
      userId: newUser.id,
      accountNumber: elecAccNum,
      utilityType: 'ELECTRICITY',
      meterNumber: `MTR-EL-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceAddressId: newAddressId,
      tariffPlanId: 'T-ELEC-RES-2026',
      status: 'ACTIVE',
      connectionDate: new Date().toISOString(),
    });

    inMemoryStore.accounts.push({
      id: `acc_${newUser.id}_watr`,
      userId: newUser.id,
      accountNumber: watrAccNum,
      utilityType: 'WATER',
      meterNumber: `MTR-WT-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceAddressId: newAddressId,
      tariffPlanId: 'T-WATR-RES-2026',
      status: 'ACTIVE',
      connectionDate: new Date().toISOString(),
    });

    saveLocalStore(inMemoryStore);
    return newUser;
  },

  async getAllUsers() {
    return inMemoryStore.users.map(({ passwordHash, ...rest }) => rest);
  },

  // --- UTILITY ACCOUNTS & ADDRESSES ---
  async getAccountsByUserId(userId: string) {
    const accounts = inMemoryStore.accounts.filter((a) => a.userId === userId);
    return accounts.map((acc) => {
      const address = inMemoryStore.addresses.find((addr) => addr.id === acc.serviceAddressId);
      return {
        ...acc,
        serviceAddress: address || null,
      };
    });
  },

  async getAccountById(id: string) {
    const acc = inMemoryStore.accounts.find((a) => a.id === id);
    if (!acc) return null;
    const address = inMemoryStore.addresses.find((addr) => addr.id === acc.serviceAddressId);
    return { ...acc, serviceAddress: address || null };
  },

  // --- BILLS ---
  async getBillsByUserId(userId: string) {
    const userAccounts = inMemoryStore.accounts.filter((a) => a.userId === userId);
    const accountIds = new Set(userAccounts.map((a) => a.id));
    const bills = inMemoryStore.bills.filter((b) => accountIds.has(b.utilityAccountId));
    
    // Sort descending by issue date
    return bills.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).map(b => {
      const account = userAccounts.find(a => a.id === b.utilityAccountId);
      return {
        ...b,
        account,
      };
    });
  },

  async getBillById(billId: string) {
    const bill = inMemoryStore.bills.find((b) => b.id === billId);
    if (!bill) return null;
    const account = inMemoryStore.accounts.find((a) => a.id === bill.utilityAccountId);
    const user = account ? inMemoryStore.users.find((u) => u.id === account.userId) : null;
    const address = account ? inMemoryStore.addresses.find((addr) => addr.id === account.serviceAddressId) : null;
    const previousBill = bill.previousBillId 
      ? inMemoryStore.bills.find((b) => b.id === bill.previousBillId)
      : null;

    return {
      ...bill,
      account: account ? { ...account, serviceAddress: address } : null,
      user: user ? { id: user.id, name: user.name, email: user.email, phone: user.phone } : null,
      previousBill: previousBill || null,
    };
  },

  async getAllBills() {
    return inMemoryStore.bills.map((b) => {
      const account = inMemoryStore.accounts.find((a) => a.id === b.utilityAccountId);
      const user = account ? inMemoryStore.users.find((u) => u.id === account.userId) : null;
      return {
        ...b,
        account,
        user: user ? { name: user.name, email: user.email } : null,
      };
    });
  },

  // --- PAYMENTS ---
  async getPaymentsByUserId(userId: string) {
    const payments = inMemoryStore.payments.filter((p) => p.userId === userId);
    return payments.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()).map((p) => {
      const bill = inMemoryStore.bills.find((b) => b.id === p.billId);
      return {
        ...p,
        bill,
      };
    });
  },

  async getAllPayments() {
    return inMemoryStore.payments.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()).map((p) => {
      const bill = inMemoryStore.bills.find((b) => b.id === p.billId);
      const user = inMemoryStore.users.find((u) => u.id === p.userId);
      return {
        ...p,
        bill,
        user: user ? { name: user.name, email: user.email } : null,
      };
    });
  },

  async getPaymentById(paymentId: string) {
    const payment = inMemoryStore.payments.find((p) => p.id === paymentId || p.internalReference === paymentId);
    if (!payment) return null;
    const bill = inMemoryStore.bills.find((b) => b.id === payment.billId);
    const user = inMemoryStore.users.find((u) => u.id === payment.userId);
    return {
      ...payment,
      bill,
      user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
    };
  },

  async createPayment(data: {
    billId: string;
    userId: string;
    amount: number;
    currency: string;
    paymentMethod: any;
    provider?: string;
    idempotencyKey?: string;
  }) {
    // Check idempotency key if provided to prevent double payment
    if (data.idempotencyKey) {
      const existing = inMemoryStore.payments.find((p) => p.idempotencyKey === data.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const bill = inMemoryStore.bills.find((b) => b.id === data.billId);
    if (!bill) {
      throw new Error('Target bill not found');
    }

    const internalRef = generatePaymentReference();
    const newPayment: MockPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      internalReference: internalRef,
      billId: data.billId,
      userId: data.userId,
      amount: data.amount,
      currency: data.currency || 'INR',
      paymentMethod: data.paymentMethod || 'UPI',
      provider: data.provider || 'RAZORPAY_SANDBOX',
      providerTransactionRef: `pay_sim_${Date.now()}`,
      status: 'PENDING',
      idempotencyKey: data.idempotencyKey,
      initiatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusEvents: [
        {
          id: `pse_${Date.now()}_1`,
          fromStatus: 'NONE',
          toStatus: 'PENDING',
          reason: 'Customer initiated checkout session',
          triggeredBy: 'CUSTOMER',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    inMemoryStore.payments.push(newPayment);
    saveLocalStore(inMemoryStore);
    return newPayment;
  },

  async updatePaymentStatus(
    paymentId: string,
    newStatus: PaymentStatus,
    reason: string,
    triggeredBy: 'CUSTOMER' | 'WEBHOOK' | 'RECONCILIATION_JOB' | 'ADMIN',
    providerRef?: string
  ) {
    const payment = inMemoryStore.payments.find((p) => p.id === paymentId || p.internalReference === paymentId);
    if (!payment) throw new Error('Payment not found');

    const fromStatus = payment.status;
    payment.status = newStatus;
    payment.updatedAt = new Date().toISOString();
    if (providerRef) payment.providerTransactionRef = providerRef;

    if (newStatus === 'SUCCESSFUL' && !payment.receiptNumber) {
      payment.receiptNumber = generateReceiptNumber();
      payment.verifiedAt = new Date().toISOString();

      // Update associated bill status
      const bill = inMemoryStore.bills.find((b) => b.id === payment.billId);
      if (bill) {
        bill.amountPaid = Math.min(bill.totalAmountDue, bill.amountPaid + payment.amount);
        bill.balanceRemaining = Math.max(0, bill.totalAmountDue - bill.amountPaid);
        bill.status = bill.balanceRemaining <= 0 ? 'PAID' : 'PARTIALLY_PAID';
      }

      // Create notification
      inMemoryStore.notifications.push({
        id: `notif_${Date.now()}`,
        userId: payment.userId,
        title: `Payment Verified: ₹${payment.amount.toFixed(2)}`,
        message: `Payment successful for bill #${bill?.billNumber || payment.billId}. Receipt #${payment.receiptNumber} is now available.`,
        type: 'PAYMENT_CONFIRMED',
        relatedPaymentId: payment.id,
        relatedBillId: payment.billId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    payment.statusEvents.push({
      id: `pse_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromStatus,
      toStatus: newStatus,
      reason,
      triggeredBy,
      createdAt: new Date().toISOString(),
    });

    saveLocalStore(inMemoryStore);
    return payment;
  },

  // --- SERVICE TICKETS ---
  async getTicketsByUserId(userId: string) {
    const tickets = inMemoryStore.tickets.filter((t) => t.userId === userId);
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAllTickets() {
    return inMemoryStore.tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((t) => {
      const user = inMemoryStore.users.find((u) => u.id === t.userId);
      const assigned = t.assignedToId ? inMemoryStore.users.find((u) => u.id === t.assignedToId) : null;
      return {
        ...t,
        user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
        assignedTo: assigned ? { name: assigned.name, email: assigned.email } : null,
      };
    });
  },

  async getTicketById(ticketIdOrNumber: string) {
    const ticket = inMemoryStore.tickets.find((t) => t.id === ticketIdOrNumber || t.ticketNumber === ticketIdOrNumber);
    if (!ticket) return null;
    const user = inMemoryStore.users.find((u) => u.id === ticket.userId);
    const assigned = ticket.assignedToId ? inMemoryStore.users.find((u) => u.id === ticket.assignedToId) : null;
    return {
      ...ticket,
      user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
      assignedTo: assigned ? { name: assigned.name, email: assigned.email } : null,
    };
  },

  async createTicket(data: {
    userId: string;
    utilityAccountId?: string;
    utilityType: 'ELECTRICITY' | 'WATER' | 'BOTH';
    category: any;
    description: string;
    serviceAddress: string;
    landmark?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactPreference?: string;
    priority?: any;
    photoUrl?: string;
  }) {
    inMemoryStore.ticketCounter += 1;
    const ticketNumber = generateTicketNumber(inMemoryStore.ticketCounter);

    const newTicket: MockServiceTicket = {
      id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketNumber,
      userId: data.userId,
      utilityAccountId: data.utilityAccountId,
      utilityType: data.utilityType,
      category: data.category,
      description: data.description,
      serviceAddress: data.serviceAddress,
      landmark: data.landmark,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      contactPreference: data.contactPreference || 'SMS',
      priority: data.priority || 'MEDIUM',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusEvents: [
        {
          id: `tse_${Date.now()}_1`,
          fromStatus: 'NONE',
          toStatus: 'SUBMITTED',
          note: 'Customer reported issue via web portal',
          isPublic: true,
          createdById: data.userId,
          createdAt: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    inMemoryStore.tickets.push(newTicket);

    // Create acknowledgement notification
    inMemoryStore.notifications.push({
      id: `notif_${Date.now()}`,
      userId: data.userId,
      title: `Ticket Submitted: ${ticketNumber}`,
      message: `Your issue regarding "${data.category}" has been registered. Triage team will acknowledge shortly.`,
      type: 'TICKET_ACKNOWLEDGED',
      relatedTicketId: newTicket.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveLocalStore(inMemoryStore);
    return newTicket;
  },

  async updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    note: string,
    adminUserId: string,
    assignedToId?: string
  ) {
    const ticket = inMemoryStore.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const fromStatus = ticket.status;
    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();
    if (assignedToId) ticket.assignedToId = assignedToId;
    if (newStatus === 'RESOLVED') ticket.resolvedAt = new Date().toISOString();

    ticket.statusEvents.push({
      id: `tse_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromStatus,
      toStatus: newStatus,
      note,
      isPublic: true,
      createdById: adminUserId,
      createdAt: new Date().toISOString(),
    });

    // Notify customer
    inMemoryStore.notifications.push({
      id: `notif_${Date.now()}`,
      userId: ticket.userId,
      title: `Ticket ${ticket.ticketNumber} is now ${newStatus}`,
      message: note,
      type: 'TICKET_UPDATED',
      relatedTicketId: ticket.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveLocalStore(inMemoryStore);
    return ticket;
  },

  async addTicketComment(ticketId: string, commentData: { authorId: string; authorName: string; authorRole: Role; comment: string; isInternal?: boolean }) {
    const ticket = inMemoryStore.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const newComment = {
      id: `tc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: commentData.authorId,
      authorName: commentData.authorName,
      authorRole: commentData.authorRole,
      comment: commentData.comment,
      isInternal: Boolean(commentData.isInternal),
      createdAt: new Date().toISOString(),
    };

    ticket.comments.push(newComment);
    ticket.updatedAt = new Date().toISOString();

    // If customer commented, notify admin/technician; if technician commented, notify customer
    if (commentData.authorRole !== 'CUSTOMER' && !commentData.isInternal) {
      inMemoryStore.notifications.push({
        id: `notif_${Date.now()}`,
        userId: ticket.userId,
        title: `Update on ticket #${ticket.ticketNumber}`,
        message: `${commentData.authorName}: ${commentData.comment.slice(0, 100)}...`,
        type: 'TICKET_UPDATED',
        relatedTicketId: ticket.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveLocalStore(inMemoryStore);
    return newComment;
  },

  // --- NOTIFICATIONS ---
  async getNotificationsByUserId(userId: string) {
    const notifs = inMemoryStore.notifications.filter((n) => n.userId === userId);
    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async markNotificationRead(id: string, userId: string) {
    const notif = inMemoryStore.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      saveLocalStore(inMemoryStore);
    }
    return notif || null;
  },

  async markAllNotificationsRead(userId: string) {
    inMemoryStore.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    saveLocalStore(inMemoryStore);
    return true;
  },

  // --- SERVICE ALERTS ---
  async getServiceAlerts() {
    return inMemoryStore.alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createServiceAlert(alertData: {
    title: string;
    message: string;
    utilityType: 'ELECTRICITY' | 'WATER' | 'ALL';
    severity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFO';
    affectedAreas: string;
    estimatedRestoration?: string;
    verifiedSource: string;
  }) {
    const newAlert: MockServiceAlert = {
      id: `alert_${Date.now()}`,
      title: alertData.title,
      message: alertData.message,
      utilityType: alertData.utilityType,
      severity: alertData.severity,
      affectedAreas: alertData.affectedAreas,
      estimatedRestoration: alertData.estimatedRestoration,
      status: 'ACTIVE',
      verifiedSource: alertData.verifiedSource,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryStore.alerts.unshift(newAlert);
    saveLocalStore(inMemoryStore);
    return newAlert;
  },

  // --- ADMIN METRICS ---
  async getAdminMetrics() {
    const totalCustomers = inMemoryStore.users.filter((u) => u.role === 'CUSTOMER').length;
    const totalBills = inMemoryStore.bills.length;
    const totalOutstanding = inMemoryStore.bills.reduce((acc, b) => acc + (b.balanceRemaining || 0), 0);
    const totalBilled = inMemoryStore.bills.reduce((acc, b) => acc + (b.totalAmountDue || 0), 0);

    const paymentsByStatus = inMemoryStore.payments.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const openTickets = inMemoryStore.tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
    const ticketsByCategory = inMemoryStore.tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uncertainPaymentsCount = inMemoryStore.payments.filter((p) => p.status === 'UNKNOWN').length;

    return {
      totalCustomers,
      totalBills,
      totalBilled: Math.round(totalBilled * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      paymentsByStatus,
      openTickets,
      ticketsByCategory,
      uncertainPaymentsCount,
      activeAlertsCount: inMemoryStore.alerts.filter((a) => a.status === 'ACTIVE').length,
    };
  },

  // --- AUDIT LOGS ---
  async recordAuditLog(log: {
    userId?: string;
    userEmail?: string;
    action: string;
    entityType: string;
    entityId?: string;
    detailsJson?: string;
    ipAddress?: string;
  }) {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: log.userId,
      userEmail: log.userEmail,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      detailsJson: log.detailsJson,
      ipAddress: log.ipAddress,
      createdAt: new Date().toISOString(),
    };
    inMemoryStore.auditLogs.unshift(entry);
    saveLocalStore(inMemoryStore);
    return entry;
  },

  async getAuditLogs(limit = 50) {
    return inMemoryStore.auditLogs.slice(0, limit);
  },

  // --- COOKIE CONSENT ---
  async recordConsent(data: { userId?: string; analyticsConsent: boolean; functionalConsent: boolean; marketingConsent: boolean }) {
    const consent = {
      id: `cs_${Date.now()}`,
      userId: data.userId,
      analyticsConsent: data.analyticsConsent,
      functionalConsent: data.functionalConsent,
      marketingConsent: data.marketingConsent,
      updatedAt: new Date().toISOString(),
    };
    inMemoryStore.consents.push(consent);
    saveLocalStore(inMemoryStore);
    return consent;
  },
};
