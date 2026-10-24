import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateUtilityBill, compareBills, round2 } from '../lib/bill-calculator.ts';
import { ELECTRICITY_TARIFF_LT2, WATER_TARIFF_RES1 } from '../lib/seed-data.ts';
import {
  verifyWebhookSignature,
  generateWebhookSignature,
  getPaymentStatusExplanation,
  generatePaymentReference,
  generateReceiptNumber,
} from '../lib/payment-gateway.ts';
import { isValidStatusTransition, generateTicketNumber } from '../lib/ticket-manager.ts';
import { ticketSubmissionSchema, loginSchema, paymentInitiationSchema } from '../lib/validations.ts';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../lib/auth.ts';

describe('1. Smart Bill Calculation Engine (Deterministic Math & Decimal Safety)', () => {
  test('A bill breakdown adds up correctly from its stored line items', () => {
    // 318 kWh calculation with LT-2 tariff
    const calc = calculateUtilityBill(318, ELECTRICITY_TARIFF_LT2);

    // Verify slabs:
    // Tier 1: 0-100 @ 3.50 = 350.00
    // Tier 2: 101-300 (200 units) @ 5.20 = 1040.00
    // Tier 3: 18 units @ 7.50 = 135.00
    // Total energy = 350 + 1040 + 135 = 1525.00
    assert.equal(calc.energyCharges, 1525.00);

    // Fixed charges = 120.00, meter = 30.00
    assert.equal(calc.fixedCharges, 120.00);
    assert.equal(calc.meterRent, 30.00);

    // Fuel surcharge (318 * 0.25) = 79.50
    assert.equal(calc.fuelSurcharge, 79.50);

    // Subtotal before tax = 120 + 30 + 1525 + 79.50 = 1754.50
    // Tax 9% = 157.905 -> rounded to 157.91
    assert.equal(calc.taxCharges, 157.91);

    // Total payable = 1754.50 + 157.91 = 1912.41
    assert.equal(calc.totalPayable, 1912.41);

    // Verify sum of line items strictly equals totalPayable
    const lineItemSum = round2(calc.lineItems.reduce((acc, li) => acc + li.amount, 0));
    assert.equal(lineItemSum, calc.totalPayable);
  });

  test('Water volumetric calculation includes correct sewerage cess', () => {
    // 26 kL with Water Tariff (15 kL @ 8, 11 kL @ 14.50)
    // 15*8 = 120, 11*14.50 = 159.50 -> Energy = 279.50
    // Sewerage 20% of 279.50 = 55.90
    // Fixed: 80.00, Meter: 25.00
    // Subtotal = 80 + 25 + 279.50 + 55.90 = 440.40
    // Tax 5% on 440.40 = 22.02
    // Total = 462.42
    const calc = calculateUtilityBill(26, WATER_TARIFF_RES1);
    assert.equal(calc.energyCharges, 279.50);
    assert.equal(calc.sewerageCharge, 55.90);
    assert.equal(calc.fixedCharges, 80.00);
    assert.equal(calc.meterRent, 25.00);
    assert.equal(calc.totalPayable, 462.42);
  });

  test('Bill comparisons identify the actual verified contributors to a difference', () => {
    const comparison = compareBills({
      currentBill: {
        billNumber: 'BILL-OCT',
        utilityType: 'ELECTRICITY',
        totalAmountDue: 1912.41,
        unitsConsumed: 318,
        fixedCharges: 120.00,
        energyCharges: 1525.00,
        taxCharges: 157.91,
        otherCharges: 109.50,
        rebateDiscount: 0,
        billingPeriodStart: '2026-09-20',
        billingPeriodEnd: '2026-10-19',
      },
      previousBill: {
        billNumber: 'BILL-SEP',
        totalAmountDue: 1403.92,
        unitsConsumed: 240,
        fixedCharges: 120.00,
        energyCharges: 1078.00,
        taxCharges: 115.92,
        otherCharges: 90.00,
        rebateDiscount: 0,
        billingPeriodStart: '2026-08-20',
        billingPeriodEnd: '2026-09-19',
      },
    });

    assert.equal(comparison.hasPreviousBill, true);
    assert.equal(comparison.absoluteChange, 508.49);
    assert.equal(comparison.unitsChange, 78);
    assert.equal(comparison.percentageChange, 36.22);

    // Largest contributor must be Electricity Consumption
    assert.ok(comparison.largestContributors.length > 0);
    assert.equal(comparison.largestContributors[0].category, 'Electricity Consumption');
    assert.equal(comparison.largestContributors[0].difference, 447.00);

    // Plain language summary must contain exact verified figures
    assert.match(comparison.plainLanguageSummary, /increased by ₹508.49/);
    assert.match(comparison.plainLanguageSummary, /Consumption increased by 78/);
  });

  test('Missing previous bill explicitly flags comparison as incomplete without fabricating data', () => {
    const comparison = compareBills({
      currentBill: {
        billNumber: 'BILL-INIT',
        utilityType: 'ELECTRICITY',
        totalAmountDue: 1200.00,
        unitsConsumed: 200,
        fixedCharges: 120.00,
        energyCharges: 1000.00,
        taxCharges: 80.00,
        otherCharges: 0,
        rebateDiscount: 0,
        billingPeriodStart: '2026-09-20',
        billingPeriodEnd: '2026-10-19',
      },
      previousBill: null,
    });

    assert.equal(comparison.hasPreviousBill, false);
    assert.equal(comparison.previousBillAmount, null);
    assert.equal(comparison.absoluteChange, null);
    assert.match(comparison.plainLanguageSummary, /Comparative variance cannot be calculated without verified previous billing records/);
  });
});

describe('2. Payment Lifecycle & Cryptographic Webhooks', () => {
  const secret = 'test_webhook_hmac_secret_key_123';

  test('Valid HMAC SHA256 signatures are accepted', () => {
    const payload = JSON.stringify({ event: 'payment.captured', entityId: 'pay_9981' });
    const validSignature = generateWebhookSignature(payload, secret);
    assert.equal(verifyWebhookSignature(payload, validSignature, secret), true);
  });

  test('Invalid provider signatures are strictly rejected', () => {
    const payload = JSON.stringify({ event: 'payment.captured', entityId: 'pay_9981' });
    assert.equal(verifyWebhookSignature(payload, 'forged_fake_signature_hash', secret), false);
    assert.equal(verifyWebhookSignature(payload, '', secret), false);
    assert.equal(verifyWebhookSignature(payload, null, secret), false);
  });

  test('Payment references and receipts follow strict unique formats', () => {
    const ref1 = generatePaymentReference();
    const ref2 = generatePaymentReference();
    assert.match(ref1, /^PAY-2026-[A-Z0-9]+$/);
    assert.notEqual(ref1, ref2);

    const rcp1 = generateReceiptNumber();
    assert.match(rcp1, /^RCP-2026-\d{6}$/);
  });

  test('Uncertain UNKNOWN payments do not allow receipt download but permit safe re-checking', () => {
    const exp = getPaymentStatusExplanation('UNKNOWN');
    assert.equal(exp.canDownloadReceipt, false);
    assert.equal(exp.canRetryCheck, true);
    assert.equal(exp.supportActionRecommended, true);
  });

  test('Successful verified payments unlock official receipt generation', () => {
    const exp = getPaymentStatusExplanation('SUCCESSFUL');
    assert.equal(exp.canDownloadReceipt, true);
    assert.equal(exp.canRetryCheck, false);
  });
});

describe('3. Service Issue & Ticket State Machine', () => {
  test('Permitted transitions follow strict lifecycle workflow', () => {
    // SUBMITTED -> ACKNOWLEDGED
    assert.equal(isValidStatusTransition('SUBMITTED', 'ACKNOWLEDGED'), true);
    // ACKNOWLEDGED -> IN_PROGRESS
    assert.equal(isValidStatusTransition('ACKNOWLEDGED', 'IN_PROGRESS'), true);
    // IN_PROGRESS -> RESOLVED
    assert.equal(isValidStatusTransition('IN_PROGRESS', 'RESOLVED'), true);
    // RESOLVED -> IN_PROGRESS (Reopening)
    assert.equal(isValidStatusTransition('RESOLVED', 'IN_PROGRESS'), true);
    // CLOSED cannot transition backwards
    assert.equal(isValidStatusTransition('CLOSED', 'IN_PROGRESS'), false);
    assert.equal(isValidStatusTransition('SUBMITTED', 'RESOLVED'), false); // Cannot jump directly
  });

  test('Ticket numbers follow UTIL-YYYY-XXXXXX pattern', () => {
    const num = generateTicketNumber(123);
    assert.equal(num, 'UTIL-2026-000123');
  });

  test('Zod validates ticket inputs correctly', () => {
    // Valid report
    const valid = ticketSubmissionSchema.safeParse({
      utilityType: 'ELECTRICITY',
      category: 'POWER_CUT',
      description: 'The street transformer sparked and power went out across block 4.',
      serviceAddress: '12th Main Indiranagar',
    });
    assert.equal(valid.success, true);

    // Invalid: description too short
    const shortDesc = ticketSubmissionSchema.safeParse({
      utilityType: 'ELECTRICITY',
      category: 'POWER_CUT',
      description: 'Power out',
      serviceAddress: 'Indiranagar',
    });
    assert.equal(shortDesc.success, false);
  });
});

describe('4. Authentication, Password Hashing & RBAC', () => {
  test('Bcrypt hashes and verifies passwords securely', async () => {
    const password = 'UtilityPass123!';
    const hash = await hashPassword(password);
    assert.notEqual(password, hash);
    assert.equal(await verifyPassword(password, hash), true);
    assert.equal(await verifyPassword('WrongPassword', hash), false);
  });

  test('JWT session tokens encode and decode session accurately', () => {
    const session = {
      userId: 'usr_priya_01',
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      role: 'CUSTOMER' as const,
    };
    const token = createSessionToken(session);
    assert.ok(token);

    const decoded = verifySessionToken(token);
    assert.ok(decoded);
    assert.equal(decoded.userId, session.userId);
    assert.equal(decoded.role, 'CUSTOMER');
  });
});
