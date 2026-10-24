export type Role = 'CUSTOMER' | 'ADMIN' | 'TECHNICIAN';

export type UtilityType = 'ELECTRICITY' | 'WATER' | 'BOTH' | 'ALL';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export type ReadingType = 'ACTUAL' | 'ESTIMATED' | 'CUSTOMER_SUBMITTED';

export type BillStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export type LineItemCategory = 
  | 'FIXED'
  | 'ENERGY_CONSUMPTION'
  | 'TIER_SLAB'
  | 'TAX_DUTY'
  | 'SURCHARGE'
  | 'SEWERAGE'
  | 'REBATE'
  | 'METER_RENT'
  | 'ADJUSTMENT';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'UNKNOWN';

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'AUTO_DEBIT';

export type TicketCategory =
  | 'POWER_CUT'
  | 'VOLTAGE_FLUCTUATION'
  | 'INFRASTRUCTURE_DAMAGE'
  | 'WATER_INTERRUPTION'
  | 'LOW_PRESSURE'
  | 'WATER_LEAKAGE'
  | 'METER_PROBLEM'
  | 'INCORRECT_BILL'
  | 'PAYMENT_PROBLEM'
  | 'OTHER';

export type TicketStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type NotificationType =
  | 'BILL_GENERATED'
  | 'BILL_DUE_SOON'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_UNCERTAIN'
  | 'PAYMENT_FAILED'
  | 'TICKET_ACKNOWLEDGED'
  | 'TICKET_UPDATED'
  | 'SERVICE_OUTAGE'
  | 'SERVICE_RESTORED'
  | 'ACCOUNT_NOTICE';

export interface TierBreakdown {
  tierOrder: number;
  minUnits: number;
  maxUnits: number | null;
  unitsInTier: number;
  ratePerUnit: number;
  tierCost: number;
}

export interface DetailedBillCalculation {
  utilityType: UtilityType;
  unitsConsumed: number;
  fixedCharges: number;
  energyCharges: number;
  meterRent: number;
  sewerageCharge: number;
  fuelSurcharge: number;
  taxCharges: number;
  rebateDiscount: number;
  totalPayable: number;
  tiers: TierBreakdown[];
  lineItems: Array<{
    category: LineItemCategory;
    description: string;
    quantity?: number;
    rate?: number;
    amount: number;
    orderIndex: number;
  }>;
}

export interface BillComparisonResult {
  hasPreviousBill: boolean;
  currency: string;
  previousBillAmount: number | null;
  currentBillAmount: number;
  absoluteChange: number | null;
  percentageChange: number | null;
  unitsChange: number | null;
  previousUnits: number | null;
  currentUnits: number;
  categoryDifferences: {
    fixedChargesChange: number;
    consumptionChargesChange: number;
    taxesSurchargesChange: number;
    rebatesChange: number;
  };
  largestContributors: Array<{
    category: string;
    difference: number;
    percentageOfChange: number;
    explanation: string;
  }>;
  plainLanguageSummary: string;
  actionableRecommendations: string[];
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
}
