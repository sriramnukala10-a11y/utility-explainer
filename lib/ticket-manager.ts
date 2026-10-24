import { TicketCategory, TicketPriority, TicketStatus, UtilityType } from './types.ts';

export const VALID_CATEGORIES: Record<TicketCategory, { label: string; defaultUtility: UtilityType; defaultPriority: TicketPriority }> = {
  POWER_CUT: { label: 'Power Cut / Blackout', defaultUtility: 'ELECTRICITY', defaultPriority: 'HIGH' },
  VOLTAGE_FLUCTUATION: { label: 'Severe Voltage Fluctuation', defaultUtility: 'ELECTRICITY', defaultPriority: 'HIGH' },
  INFRASTRUCTURE_DAMAGE: { label: 'Damaged Electrical Infrastructure (Pole/Transformer/Wire)', defaultUtility: 'ELECTRICITY', defaultPriority: 'CRITICAL' },
  WATER_INTERRUPTION: { label: 'Complete Water Supply Outage', defaultUtility: 'WATER', defaultPriority: 'HIGH' },
  LOW_PRESSURE: { label: 'Low Water Pressure', defaultUtility: 'WATER', defaultPriority: 'MEDIUM' },
  WATER_LEAKAGE: { label: 'Pipeline Burst / Main Line Leakage', defaultUtility: 'WATER', defaultPriority: 'HIGH' },
  METER_PROBLEM: { label: 'Faulty / Stopped Meter Display', defaultUtility: 'BOTH', defaultPriority: 'MEDIUM' },
  INCORRECT_BILL: { label: 'Disputed or Incorrect Bill Calculation', defaultUtility: 'BOTH', defaultPriority: 'MEDIUM' },
  PAYMENT_PROBLEM: { label: 'Payment Deducted but Not Credited', defaultUtility: 'BOTH', defaultPriority: 'HIGH' },
  OTHER: { label: 'Other Utility Inquiry / Issue', defaultUtility: 'BOTH', defaultPriority: 'LOW' },
};

export const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  SUBMITTED: ['ACKNOWLEDGED', 'CLOSED'],
  ACKNOWLEDGED: ['ASSIGNED', 'IN_PROGRESS', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'WAITING_CUSTOMER', 'CLOSED'],
  IN_PROGRESS: ['WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'],
  WAITING_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'], // Reopening permitted from RESOLVED
  CLOSED: [], // Terminal status
};

export function isValidStatusTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function generateTicketNumber(counter: number): string {
  const year = new Date().getFullYear();
  const padded = counter.toString().padStart(6, '0');
  return `UTIL-${year}-${padded}`;
}

export function getStatusBadgeInfo(status: TicketStatus): { label: string; color: string; description: string } {
  switch (status) {
    case 'SUBMITTED':
      return {
        label: 'Submitted',
        color: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
        description: 'Your report has been logged and queued for triage by our dispatch operations center.',
      };
    case 'ACKNOWLEDGED':
      return {
        label: 'Acknowledged',
        color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300',
        description: 'An operator has reviewed your ticket and verified service area details.',
      };
    case 'ASSIGNED':
      return {
        label: 'Field Tech Assigned',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300',
        description: 'A technician or regional engineering squad has been assigned to investigate.',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
        description: 'Active repair or investigation work is currently underway on site or in billing systems.',
      };
    case 'WAITING_CUSTOMER':
      return {
        label: 'Waiting for Customer Info',
        color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300',
        description: 'Our team requires additional details from you (e.g., premises access, photo, or meter reading).',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
        description: 'The outage or billing discrepancy has been resolved. You can reopen this within 7 days if the issue persists.',
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        color: 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400',
        description: 'Ticket is closed. A satisfaction survey or service log has been archived.',
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        description: '',
      };
  }
}
