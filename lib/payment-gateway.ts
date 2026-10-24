import crypto from 'crypto';
import { PaymentMethod, PaymentStatus } from './types.ts';

export interface PaymentInitiationRequest {
  billId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  idempotencyKey?: string;
}

export interface PaymentInitiationResult {
  internalReference: string;
  provider: string;
  providerOrderId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  notes: string;
  isSimulated: boolean;
}

export interface WebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string; // Provider transaction ref (e.g. pay_xxx)
        order_id?: string;
        amount: number; // in subunits (paise) or full units depending on provider
        currency: string;
        status: string; // captured, failed, etc.
        method?: string;
        error_code?: string;
        error_description?: string;
      };
    };
  };
}

export interface StatusExplanation {
  title: string;
  badgeClass: string;
  explanation: string;
  canDownloadReceipt: boolean;
  canRetryCheck: boolean;
  supportActionRecommended: boolean;
}

/**
 * Returns user-facing plain language guidance for payment statuses
 */
export function getPaymentStatusExplanation(status: PaymentStatus): StatusExplanation {
  switch (status) {
    case 'PENDING':
      return {
        title: 'Payment Initiated',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300',
        explanation: 'Your transaction has been created and is awaiting confirmation from your bank or payment provider. If you completed payment in your UPI app or banking portal, it may take 2-3 minutes to update.',
        canDownloadReceipt: false,
        canRetryCheck: true,
        supportActionRecommended: false,
      };
    case 'PROCESSING':
      return {
        title: 'Payment Processing',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300',
        explanation: 'The payment gateway has accepted your transaction and is awaiting settlement confirmation from the clearing house. Funds may be reserved in your account.',
        canDownloadReceipt: false,
        canRetryCheck: true,
        supportActionRecommended: false,
      };
    case 'SUCCESSFUL':
      return {
        title: 'Payment Verified & Settled',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300',
        explanation: 'Payment has been verified through a cryptographic signature response. Your utility account balance is updated immediately and an official receipt is issued.',
        canDownloadReceipt: true,
        canRetryCheck: false,
        supportActionRecommended: false,
      };
    case 'FAILED':
      return {
        title: 'Payment Declined / Failed',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300',
        explanation: 'The issuing bank or gateway declined this transaction. No funds were captured. If any amount was deducted from your account, banks automatically reverse it within 3-5 business days.',
        canDownloadReceipt: false,
        canRetryCheck: false,
        supportActionRecommended: true,
      };
    case 'UNKNOWN':
      return {
        title: 'Outcome Uncertain (Under Review)',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300',
        explanation: 'The final outcome could not be verified within the standard timeout window. We have flagged this transaction for automated reconciliation. Do not initiate a duplicate payment while status is under review.',
        canDownloadReceipt: false,
        canRetryCheck: true,
        supportActionRecommended: true,
      };
    default:
      return {
        title: 'Status Pending',
        badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        explanation: 'Payment state is updating.',
        canDownloadReceipt: false,
        canRetryCheck: true,
        supportActionRecommended: false,
      };
  }
}

/**
 * Validates cryptographic webhook signature (HMAC-SHA256)
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

/**
 * Generates an HMAC signature for testing webhook payloads
 */
export function generateWebhookSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/**
 * Generates human-readable reference IDs
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PAY-${new Date().getFullYear()}-${timestamp.slice(-4)}${random}`;
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  return `RCP-${year}-${seq}`;
}
