import { TariffPlanConfig } from './bill-calculator.ts';
import { round2 } from './bill-calculator.ts';

export const ELECTRICITY_TARIFF_LT2: TariffPlanConfig = {
  code: 'T-ELEC-RES-2026',
  utilityType: 'ELECTRICITY',
  fixedChargeMonthly: 120.00,
  meterRentMonthly: 30.00,
  taxRatePercent: 9.0,
  fuelSurchargeRate: 0.25,
  sewerageRatePercent: 0,
  tiers: [
    { tierOrder: 1, minUnits: 0, maxUnits: 100, ratePerUnit: 3.50 },
    { tierOrder: 2, minUnits: 100, maxUnits: 300, ratePerUnit: 5.20 },
    { tierOrder: 3, minUnits: 300, maxUnits: 500, ratePerUnit: 7.50 },
    { tierOrder: 4, minUnits: 500, maxUnits: null, ratePerUnit: 9.00 },
  ],
};

export const WATER_TARIFF_RES1: TariffPlanConfig = {
  code: 'T-WATR-RES-2026',
  utilityType: 'WATER',
  fixedChargeMonthly: 80.00,
  meterRentMonthly: 25.00,
  taxRatePercent: 5.0,
  fuelSurchargeRate: 0,
  sewerageRatePercent: 20.0,
  tiers: [
    { tierOrder: 1, minUnits: 0, maxUnits: 15, ratePerUnit: 8.00 },
    { tierOrder: 2, minUnits: 15, maxUnits: 30, ratePerUnit: 14.50 },
    { tierOrder: 3, minUnits: 30, maxUnits: null, ratePerUnit: 24.00 },
  ],
};

export interface MockUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'TECHNICIAN';
  passwordHash: string; // bcrypt hash for 'UtilityPass123!' or 'AdminSecure2026!'
  avatarUrl?: string;
  createdAt: string;
}

export interface MockServiceAddress {
  id: string;
  userId: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  landmark: string;
  isPrimary: boolean;
}

export interface MockUtilityAccount {
  id: string;
  userId: string;
  accountNumber: string;
  utilityType: 'ELECTRICITY' | 'WATER';
  meterNumber: string;
  serviceAddressId: string;
  tariffPlanId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  connectionDate: string;
}

export interface MockMeterReading {
  id: string;
  utilityAccountId: string;
  readingDate: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  readingType: 'ACTUAL' | 'ESTIMATED' | 'CUSTOMER_SUBMITTED';
  notes: string;
}

export interface MockBillLineItem {
  id: string;
  billId: string;
  category: string;
  description: string;
  quantity?: number;
  rate?: number;
  amount: number;
  orderIndex: number;
}

export interface MockBill {
  id: string;
  utilityAccountId: string;
  billNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  issueDate: string;
  meterReadingId?: string;
  previousBillId?: string;
  unitsConsumed: number;
  previousUnitsConsumed?: number;
  previousAmount?: number;
  currentAmount: number;
  fixedCharges: number;
  energyCharges: number;
  taxCharges: number;
  otherCharges: number;
  rebateDiscount: number;
  totalAmountDue: number;
  amountPaid: number;
  balanceRemaining: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  notes?: string;
  lineItems: MockBillLineItem[];
}

export interface MockPayment {
  id: string;
  internalReference: string;
  billId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'AUTO_DEBIT';
  provider: string;
  providerTransactionRef?: string;
  providerOrderId?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'UNKNOWN';
  failureReason?: string;
  idempotencyKey?: string;
  receiptNumber?: string;
  initiatedAt: string;
  verifiedAt?: string;
  updatedAt: string;
  statusEvents: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    reason: string;
    triggeredBy: string;
    createdAt: string;
  }>;
}

export interface MockServiceTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  utilityAccountId?: string;
  utilityType: 'ELECTRICITY' | 'WATER' | 'BOTH';
  category: any;
  description: string;
  serviceAddress: string;
  landmark?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactPreference: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedToId?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  statusEvents: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    note: string;
    isPublic: boolean;
    createdById: string;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    comment: string;
    isInternal: boolean;
    createdAt: string;
  }>;
}

export interface MockNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: any;
  relatedBillId?: string;
  relatedPaymentId?: string;
  relatedTicketId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MockServiceAlert {
  id: string;
  title: string;
  message: string;
  utilityType: 'ELECTRICITY' | 'WATER' | 'ALL';
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFO';
  affectedAreas: string;
  estimatedRestoration?: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESTORED';
  verifiedSource: string;
  createdAt: string;
  updatedAt: string;
}

// Bcrypt hash for 'UtilityPass123!' = $2a$10$wT3WfE4mE58c2WkZ5wTfVuD1HqH9f8sOqB1I2.uG2U5rWJm4WvJiq
// Bcrypt hash for 'AdminSecure2026!' = $2a$10$q9XW6s4g7b.d6v5H8w3LauU8R4h3uJ2m9s8.k1w1L1K5i6l5M5k7O
export const INITIAL_USERS: MockUser[] = [
  {
    id: 'usr_priya_01',
    email: 'priya.sharma@example.com',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    // Pre-computed hash of "UtilityPass123!"
    passwordHash: '$2a$10$z57p3P1oqvqQ0V.X17eMpeC2mK6O.r5WzH/d96b0I6N6dZ9O5qGzK',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'usr_rahul_02',
    email: 'rahul.verma@example.com',
    name: 'Rahul Verma',
    phone: '+91 98111 22334',
    role: 'CUSTOMER',
    passwordHash: '$2a$10$z57p3P1oqvqQ0V.X17eMpeC2mK6O.r5WzH/d96b0I6N6dZ9O5qGzK',
    createdAt: '2026-08-15T09:30:00.000Z',
  },
  {
    id: 'usr_admin_01',
    email: 'admin@utilityservice.gov',
    name: 'Chief Utility Administrator',
    phone: '+91 80222 33445',
    role: 'ADMIN',
    passwordHash: '$2a$10$z57p3P1oqvqQ0V.X17eMpeC2mK6O.r5WzH/d96b0I6N6dZ9O5qGzK',
    createdAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'usr_tech_01',
    email: 'tech.murthy@utilityservice.gov',
    name: 'K. Murthy (Sr. Linesman)',
    phone: '+91 94480 11223',
    role: 'TECHNICIAN',
    passwordHash: '$2a$10$z57p3P1oqvqQ0V.X17eMpeC2mK6O.r5WzH/d96b0I6N6dZ9O5qGzK',
    createdAt: '2026-07-15T00:00:00.000Z',
  },
];

export const INITIAL_ADDRESSES: MockServiceAddress[] = [
  {
    id: 'addr_priya_01',
    userId: 'usr_priya_01',
    streetAddress: 'Flat 402, Green Acres Apt, 12th Main Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    landmark: 'Near Indiranagar Club',
    isPrimary: true,
  },
  {
    id: 'addr_rahul_01',
    userId: 'usr_rahul_02',
    streetAddress: 'Villa 12, Palm Meadows, ECC Road, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
    landmark: 'Behind Forum Value Mall',
    isPrimary: true,
  },
];

export const INITIAL_ACCOUNTS: MockUtilityAccount[] = [
  {
    id: 'acc_priya_elec',
    userId: 'usr_priya_01',
    accountNumber: 'ELEC-882941',
    utilityType: 'ELECTRICITY',
    meterNumber: 'MTR-EL-90142',
    serviceAddressId: 'addr_priya_01',
    tariffPlanId: 'T-ELEC-RES-2026',
    status: 'ACTIVE',
    connectionDate: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'acc_priya_watr',
    userId: 'usr_priya_01',
    accountNumber: 'WATR-441029',
    utilityType: 'WATER',
    meterNumber: 'MTR-WT-31890',
    serviceAddressId: 'addr_priya_01',
    tariffPlanId: 'T-WATR-RES-2026',
    status: 'ACTIVE',
    connectionDate: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'acc_rahul_elec',
    userId: 'usr_rahul_02',
    accountNumber: 'ELEC-771490',
    utilityType: 'ELECTRICITY',
    meterNumber: 'MTR-EL-88210',
    serviceAddressId: 'addr_rahul_01',
    tariffPlanId: 'T-ELEC-RES-2026',
    status: 'ACTIVE',
    connectionDate: '2025-06-01T00:00:00.000Z',
  },
];

export const INITIAL_BILLS: MockBill[] = [
  // 1. Priya's Previous Electricity Bill (Sept 2026) - Paid
  {
    id: 'bill_priya_elec_sep2026',
    utilityAccountId: 'acc_priya_elec',
    billNumber: 'BILL-2026-09-8829',
    billingPeriodStart: '2026-08-20T00:00:00.000Z',
    billingPeriodEnd: '2026-09-19T00:00:00.000Z',
    issueDate: '2026-09-20T00:00:00.000Z',
    dueDate: '2026-10-05T00:00:00.000Z',
    unitsConsumed: 240,
    currentAmount: 1403.92,
    fixedCharges: 120.00,
    energyCharges: 1078.00, // 100*3.50 + 140*5.20 = 350 + 728
    taxCharges: 115.92,
    otherCharges: 90.00, // meter rent 30 + fuel surcharge 60
    rebateDiscount: 0,
    totalAmountDue: 1403.92,
    amountPaid: 1403.92,
    balanceRemaining: 0,
    status: 'PAID',
    lineItems: [
      { id: 'li_sep_1', billId: 'bill_priya_elec_sep2026', category: 'FIXED', description: 'Standard Monthly Fixed Standing Charge', amount: 120.00, orderIndex: 1 },
      { id: 'li_sep_2', billId: 'bill_priya_elec_sep2026', category: 'METER_RENT', description: 'Meter Service & Maintenance Fee', amount: 30.00, orderIndex: 2 },
      { id: 'li_sep_3', billId: 'bill_priya_elec_sep2026', category: 'TIER_SLAB', description: 'Consumption Slab 1 (0-100 units @ ₹3.50/unit)', quantity: 100, rate: 3.50, amount: 350.00, orderIndex: 3 },
      { id: 'li_sep_4', billId: 'bill_priya_elec_sep2026', category: 'TIER_SLAB', description: 'Consumption Slab 2 (101-300 units @ ₹5.20/unit)', quantity: 140, rate: 5.20, amount: 728.00, orderIndex: 4 },
      { id: 'li_sep_5', billId: 'bill_priya_elec_sep2026', category: 'SURCHARGE', description: 'Fuel & Power Purchase Price Adjustment (FAC)', quantity: 240, rate: 0.25, amount: 60.00, orderIndex: 5 },
      { id: 'li_sep_6', billId: 'bill_priya_elec_sep2026', category: 'TAX_DUTY', description: 'Electricity Duty & Local Surcharge (9%)', amount: 115.92, orderIndex: 6 },
    ],
  },
  // 2. Priya's Current Electricity Bill (Oct 2026) - Unpaid, higher consumption
  {
    id: 'bill_priya_elec_oct2026',
    utilityAccountId: 'acc_priya_elec',
    billNumber: 'BILL-2026-10-8829',
    billingPeriodStart: '2026-09-20T00:00:00.000Z',
    billingPeriodEnd: '2026-10-19T00:00:00.000Z',
    issueDate: '2026-10-20T00:00:00.000Z',
    dueDate: '2026-11-05T00:00:00.000Z',
    previousBillId: 'bill_priya_elec_sep2026',
    unitsConsumed: 318, // +78 units higher!
    previousUnitsConsumed: 240,
    previousAmount: 1403.92,
    currentAmount: 1912.41,
    fixedCharges: 120.00,
    energyCharges: 1525.00, // 100*3.50 + 200*5.20 + 18*7.50 = 350 + 1040 + 135
    taxCharges: 157.91,
    otherCharges: 109.50, // meter rent 30 + fuel surcharge 79.50 (318 * 0.25)
    rebateDiscount: 0,
    totalAmountDue: 1912.41,
    amountPaid: 0,
    balanceRemaining: 1912.41,
    status: 'UNPAID',
    lineItems: [
      { id: 'li_oct_1', billId: 'bill_priya_elec_oct2026', category: 'FIXED', description: 'Standard Monthly Fixed Standing Charge', amount: 120.00, orderIndex: 1 },
      { id: 'li_oct_2', billId: 'bill_priya_elec_oct2026', category: 'METER_RENT', description: 'Meter Service & Maintenance Fee', amount: 30.00, orderIndex: 2 },
      { id: 'li_oct_3', billId: 'bill_priya_elec_oct2026', category: 'TIER_SLAB', description: 'Consumption Slab 1 (0-100 units @ ₹3.50/unit)', quantity: 100, rate: 3.50, amount: 350.00, orderIndex: 3 },
      { id: 'li_oct_4', billId: 'bill_priya_elec_oct2026', category: 'TIER_SLAB', description: 'Consumption Slab 2 (101-300 units @ ₹5.20/unit)', quantity: 200, rate: 5.20, amount: 1040.00, orderIndex: 4 },
      { id: 'li_oct_5', billId: 'bill_priya_elec_oct2026', category: 'TIER_SLAB', description: 'Consumption Slab 3 (301-500 units @ ₹7.50/unit)', quantity: 18, rate: 7.50, amount: 135.00, orderIndex: 5 },
      { id: 'li_oct_6', billId: 'bill_priya_elec_oct2026', category: 'SURCHARGE', description: 'Fuel & Power Purchase Price Adjustment (FAC)', quantity: 318, rate: 0.25, amount: 79.50, orderIndex: 6 },
      { id: 'li_oct_7', billId: 'bill_priya_elec_oct2026', category: 'TAX_DUTY', description: 'Electricity Duty & Local Surcharge (9%)', amount: 157.91, orderIndex: 7 },
    ],
  },
  // 3. Priya's Water Bill (Sept 2026) - Paid
  {
    id: 'bill_priya_watr_sep2026',
    utilityAccountId: 'acc_priya_watr',
    billNumber: 'BILL-2026-09-4410',
    billingPeriodStart: '2026-08-20T00:00:00.000Z',
    billingPeriodEnd: '2026-09-19T00:00:00.000Z',
    issueDate: '2026-09-20T00:00:00.000Z',
    dueDate: '2026-10-05T00:00:00.000Z',
    unitsConsumed: 18, // kL
    currentAmount: 340.50,
    fixedCharges: 80.00,
    energyCharges: 163.50, // 15*8.00 + 3*14.50 = 120 + 43.50
    taxCharges: 16.21,
    otherCharges: 80.79, // meter 25 + sewerage (20% of 163.50 = 32.70)
    rebateDiscount: 0,
    totalAmountDue: 340.50,
    amountPaid: 340.50,
    balanceRemaining: 0,
    status: 'PAID',
    lineItems: [
      { id: 'li_wsep_1', billId: 'bill_priya_watr_sep2026', category: 'FIXED', description: 'Water Standing Base Charge', amount: 80.00, orderIndex: 1 },
      { id: 'li_wsep_2', billId: 'bill_priya_watr_sep2026', category: 'METER_RENT', description: 'Water Meter Maintenance Fee', amount: 25.00, orderIndex: 2 },
      { id: 'li_wsep_3', billId: 'bill_priya_watr_sep2026', category: 'TIER_SLAB', description: 'Volumetric Slab 1 (0-15 kL @ ₹8.00/kL)', quantity: 15, rate: 8.00, amount: 120.00, orderIndex: 3 },
      { id: 'li_wsep_4', billId: 'bill_priya_watr_sep2026', category: 'TIER_SLAB', description: 'Volumetric Slab 2 (16-30 kL @ ₹14.50/kL)', quantity: 3, rate: 14.50, amount: 43.50, orderIndex: 4 },
      { id: 'li_wsep_5', billId: 'bill_priya_watr_sep2026', category: 'SEWERAGE', description: 'Sewerage & Effluent Sanitation Cess (20%)', amount: 32.70, orderIndex: 5 },
      { id: 'li_wsep_6', billId: 'bill_priya_watr_sep2026', category: 'TAX_DUTY', description: 'Municipal Water Cess (5%)', amount: 16.21, orderIndex: 6 },
    ],
  },
  // 4. Priya's Current Water Bill (Oct 2026) - Unpaid
  {
    id: 'bill_priya_watr_oct2026',
    utilityAccountId: 'acc_priya_watr',
    billNumber: 'BILL-2026-10-4410',
    billingPeriodStart: '2026-09-20T00:00:00.000Z',
    billingPeriodEnd: '2026-10-19T00:00:00.000Z',
    issueDate: '2026-10-20T00:00:00.000Z',
    dueDate: '2026-11-05T00:00:00.000Z',
    previousBillId: 'bill_priya_watr_sep2026',
    unitsConsumed: 26, // kL (+8 kL increase)
    previousUnitsConsumed: 18,
    previousAmount: 340.50,
    currentAmount: 510.40,
    fixedCharges: 80.00,
    energyCharges: 279.50, // 15*8.00 + 11*14.50 = 120 + 159.50
    taxCharges: 24.30,
    otherCharges: 126.60, // meter 25 + sewerage 55.90 + adjustments
    rebateDiscount: 0,
    totalAmountDue: 510.40,
    amountPaid: 0,
    balanceRemaining: 510.40,
    status: 'UNPAID',
    lineItems: [
      { id: 'li_woct_1', billId: 'bill_priya_watr_oct2026', category: 'FIXED', description: 'Water Standing Base Charge', amount: 80.00, orderIndex: 1 },
      { id: 'li_woct_2', billId: 'bill_priya_watr_oct2026', category: 'METER_RENT', description: 'Water Meter Maintenance Fee', amount: 25.00, orderIndex: 2 },
      { id: 'li_woct_3', billId: 'bill_priya_watr_oct2026', category: 'TIER_SLAB', description: 'Volumetric Slab 1 (0-15 kL @ ₹8.00/kL)', quantity: 15, rate: 8.00, amount: 120.00, orderIndex: 3 },
      { id: 'li_woct_4', billId: 'bill_priya_watr_oct2026', category: 'TIER_SLAB', description: 'Volumetric Slab 2 (16-30 kL @ ₹14.50/kL)', quantity: 11, rate: 14.50, amount: 159.50, orderIndex: 4 },
      { id: 'li_woct_5', billId: 'bill_priya_watr_oct2026', category: 'SEWERAGE', description: 'Sewerage & Effluent Sanitation Cess (20%)', amount: 55.90, orderIndex: 5 },
      { id: 'li_woct_6', billId: 'bill_priya_watr_oct2026', category: 'TAX_DUTY', description: 'Municipal Water Cess (5%)', amount: 24.30, orderIndex: 6 },
    ],
  },
];

export const INITIAL_PAYMENTS: MockPayment[] = [
  // Verified successful payment with receipt
  {
    id: 'pay_01_success',
    internalReference: 'PAY-2026-SP9810',
    billId: 'bill_priya_elec_sep2026',
    userId: 'usr_priya_01',
    amount: 1403.92,
    currency: 'INR',
    paymentMethod: 'UPI',
    provider: 'RAZORPAY_SANDBOX',
    providerTransactionRef: 'pay_Rzp992817x',
    providerOrderId: 'order_O99182741',
    status: 'SUCCESSFUL',
    receiptNumber: 'RCP-2026-881290',
    initiatedAt: '2026-09-25T14:20:00.000Z',
    verifiedAt: '2026-09-25T14:22:15.000Z',
    updatedAt: '2026-09-25T14:22:15.000Z',
    statusEvents: [
      { id: 'pse_1', fromStatus: 'NONE', toStatus: 'PENDING', reason: 'Order created via checkout', triggeredBy: 'CUSTOMER', createdAt: '2026-09-25T14:20:00.000Z' },
      { id: 'pse_2', fromStatus: 'PENDING', toStatus: 'PROCESSING', reason: 'UPI payment authorization request dispatched to NPCI', triggeredBy: 'CUSTOMER', createdAt: '2026-09-25T14:21:05.000Z' },
      { id: 'pse_3', fromStatus: 'PROCESSING', toStatus: 'SUCCESSFUL', reason: 'Webhook payment.captured received with verified HMAC signature', triggeredBy: 'WEBHOOK', createdAt: '2026-09-25T14:22:15.000Z' },
    ],
  },
  // An UNKNOWN payment awaiting reconciliation
  {
    id: 'pay_02_unknown',
    internalReference: 'PAY-2026-UN7721',
    billId: 'bill_priya_elec_oct2026',
    userId: 'usr_priya_01',
    amount: 500.00,
    currency: 'INR',
    paymentMethod: 'NET_BANKING',
    provider: 'RAZORPAY_SANDBOX',
    providerTransactionRef: 'pay_BankPend441',
    status: 'UNKNOWN',
    failureReason: 'Gateway response timeout during bank clearance (HTTP 504 from acquiring bank). Queued for automated dual-reconciliation.',
    initiatedAt: '2026-10-22T10:15:00.000Z',
    updatedAt: '2026-10-22T10:20:00.000Z',
    statusEvents: [
      { id: 'pse_4', fromStatus: 'NONE', toStatus: 'PENDING', reason: 'Netbanking session initiated', triggeredBy: 'CUSTOMER', createdAt: '2026-10-22T10:15:00.000Z' },
      { id: 'pse_5', fromStatus: 'PENDING', toStatus: 'PROCESSING', reason: 'Redirected to HDFC NetBanking gateway', triggeredBy: 'CUSTOMER', createdAt: '2026-10-22T10:16:00.000Z' },
      { id: 'pse_6', fromStatus: 'PROCESSING', toStatus: 'UNKNOWN', reason: 'Inconclusive bank callback timeout. Status remains UNKNOWN pending ledger audit.', triggeredBy: 'RECONCILIATION_JOB', createdAt: '2026-10-22T10:20:00.000Z' },
    ],
  },
];

export const INITIAL_TICKETS: MockServiceTicket[] = [
  {
    id: 'tkt_01',
    ticketNumber: 'UTIL-2026-000101',
    userId: 'usr_priya_01',
    utilityAccountId: 'acc_priya_elec',
    utilityType: 'ELECTRICITY',
    category: 'VOLTAGE_FLUCTUATION',
    description: 'Repeated severe voltage drops below 160V observed between 18:00 and 21:00. Multiple appliances tripped.',
    serviceAddress: 'Flat 402, Green Acres Apt, Indiranagar, Bengaluru 560038',
    landmark: 'Behind Indiranagar Club',
    contactPhone: '+91 98765 43210',
    contactPreference: 'SMS',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedToId: 'usr_tech_01',
    createdAt: '2026-10-22T18:45:00.000Z',
    updatedAt: '2026-10-23T11:20:00.000Z',
    statusEvents: [
      { id: 'tse_1', fromStatus: 'NONE', toStatus: 'SUBMITTED', note: 'Customer logged outage/quality complaint via web portal', isPublic: true, createdById: 'usr_priya_01', createdAt: '2026-10-22T18:45:00.000Z' },
      { id: 'tse_2', fromStatus: 'SUBMITTED', toStatus: 'ACKNOWLEDGED', note: 'Ticket reviewed by dispatch operator. Feeder F-12 identified.', isPublic: true, createdById: 'usr_admin_01', createdAt: '2026-10-22T19:15:00.000Z' },
      { id: 'tse_3', fromStatus: 'ACKNOWLEDGED', toStatus: 'ASSIGNED', note: 'Assigned to K. Murthy (Sr. Linesman) for field transformer load balancing.', isPublic: true, createdById: 'usr_admin_01', createdAt: '2026-10-23T09:30:00.000Z' },
      { id: 'tse_4', fromStatus: 'ASSIGNED', toStatus: 'IN_PROGRESS', note: 'Crew on site checking distribution box and phase balance.', isPublic: true, createdById: 'usr_tech_01', createdAt: '2026-10-23T11:20:00.000Z' },
    ],
    comments: [
      { id: 'tc_1', authorId: 'usr_priya_01', authorName: 'Priya Sharma', authorRole: 'CUSTOMER', comment: 'Voltage dropped again at 7:30 PM. AC compressor shut off automatically.', isInternal: false, createdAt: '2026-10-22T19:35:00.000Z' },
      { id: 'tc_2', authorId: 'usr_tech_01', authorName: 'K. Murthy', authorRole: 'TECHNICIAN', comment: 'Found Phase 2 experiencing heavy load imbalance from commercial street lighting. Adjusting tap changer.', isInternal: false, createdAt: '2026-10-23T11:25:00.000Z' },
    ],
  },
  {
    id: 'tkt_02',
    ticketNumber: 'UTIL-2026-000102',
    userId: 'usr_priya_01',
    utilityAccountId: 'acc_priya_watr',
    utilityType: 'WATER',
    category: 'WATER_LEAKAGE',
    description: 'Clean drinking water gushing from underground pipeline joint near apartment entry gate.',
    serviceAddress: 'Flat 402, Green Acres Apt, Indiranagar, Bengaluru 560038',
    landmark: 'Opposite gate 2',
    contactPreference: 'SMS',
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-10-24T07:15:00.000Z',
    updatedAt: '2026-10-24T08:00:00.000Z',
    statusEvents: [
      { id: 'tse_5', fromStatus: 'NONE', toStatus: 'SUBMITTED', note: 'Leakage reported with geo-tag', isPublic: true, createdById: 'usr_priya_01', createdAt: '2026-10-24T07:15:00.000Z' },
      { id: 'tse_6', fromStatus: 'SUBMITTED', toStatus: 'ACKNOWLEDGED', note: 'Water supply line isolated. Excavation permit requested.', isPublic: true, createdById: 'usr_admin_01', createdAt: '2026-10-24T08:00:00.000Z' },
    ],
    comments: [],
  },
];

export const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif_1',
    userId: 'usr_priya_01',
    title: 'New Electricity Bill Available (Oct 2026)',
    message: 'Your bill for 318 kWh (₹1,912.41) has been generated. Due date is Nov 05, 2026.',
    type: 'BILL_GENERATED',
    relatedBillId: 'bill_priya_elec_oct2026',
    isRead: false,
    createdAt: '2026-10-20T00:05:00.000Z',
  },
  {
    id: 'notif_2',
    userId: 'usr_priya_01',
    title: 'Ticket #UTIL-2026-000101 Updated',
    message: 'Field technician K. Murthy has begun work on the Indiranagar voltage issue.',
    type: 'TICKET_UPDATED',
    relatedTicketId: 'tkt_01',
    isRead: false,
    createdAt: '2026-10-23T11:20:00.000Z',
  },
  {
    id: 'notif_3',
    userId: 'usr_priya_01',
    title: 'Payment Confirmation: ₹1,403.92',
    message: 'Your electricity payment for Sept 2026 was verified successfully. Receipt #RCP-2026-881290 is ready.',
    type: 'PAYMENT_CONFIRMED',
    relatedPaymentId: 'pay_01_success',
    isRead: true,
    createdAt: '2026-09-25T14:23:00.000Z',
  },
];

export const INITIAL_ALERTS: MockServiceAlert[] = [
  {
    id: 'alert_01',
    title: 'Scheduled Substation Transformer Maintenance',
    message: 'Routine pre-winter maintenance at Indiranagar 66kV Substation. Intermittent power outages expected between 09:00 AM and 01:00 PM.',
    utilityType: 'ELECTRICITY',
    severity: 'WARNING',
    affectedAreas: 'Indiranagar 1st & 2nd Stage, Defence Colony, HAL 2nd Stage',
    estimatedRestoration: '2026-10-26T13:00:00.000Z',
    status: 'ACTIVE',
    verifiedSource: 'BESCOM Operations Control Room (Verified)',
    createdAt: '2026-10-23T06:00:00.000Z',
    updatedAt: '2026-10-23T06:00:00.000Z',
  },
  {
    id: 'alert_02',
    title: 'Potable Water Pipeline Pressure Stabilization',
    message: 'Cauvery Water Supply Stage IV line valve recalibration. Water pressure will remain low throughout morning hours.',
    utilityType: 'WATER',
    severity: 'INFO',
    affectedAreas: 'East Bengaluru Sub-divisions 3 & 4',
    estimatedRestoration: '2026-10-25T16:00:00.000Z',
    status: 'ACTIVE',
    verifiedSource: 'BWSSB Central Water Works',
    createdAt: '2026-10-24T05:00:00.000Z',
    updatedAt: '2026-10-24T05:00:00.000Z',
  },
];
