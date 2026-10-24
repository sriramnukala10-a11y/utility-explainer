import type { DetailedBillCalculation, TierBreakdown, BillComparisonResult, UtilityType } from './types.ts';

export interface TariffTierConfig {
  tierOrder: number;
  minUnits: number;
  maxUnits: number | null;
  ratePerUnit: number;
}

export interface TariffPlanConfig {
  code: string;
  utilityType: UtilityType;
  fixedChargeMonthly: number;
  meterRentMonthly: number;
  taxRatePercent: number;
  fuelSurchargeRate: number; // e.g. rate per unit or fixed
  sewerageRatePercent: number; // For water, % of consumption
  tiers: TariffTierConfig[];
}

// Decimal-safe rounding to 2 decimal places
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Deterministically calculates tiered utility bill from units consumed and tariff configuration
 */
export function calculateUtilityBill(
  unitsConsumed: number,
  tariff: TariffPlanConfig,
  promptPaymentEligible = false
): DetailedBillCalculation {
  const units = Math.max(0, unitsConsumed);
  const tiers: TierBreakdown[] = [];
  let remainingUnits = units;
  let energyCharges = 0;

  // Sort tiers by tierOrder ascending
  const sortedTiers = [...tariff.tiers].sort((a, b) => a.tierOrder - b.tierOrder);

  for (const tier of sortedTiers) {
    if (remainingUnits <= 0) {
      tiers.push({
        tierOrder: tier.tierOrder,
        minUnits: tier.minUnits,
        maxUnits: tier.maxUnits,
        unitsInTier: 0,
        ratePerUnit: tier.ratePerUnit,
        tierCost: 0,
      });
      continue;
    }

    const tierCapacity = tier.maxUnits !== null 
      ? tier.maxUnits - tier.minUnits 
      : Infinity;

    const unitsInThisTier = Math.min(remainingUnits, tierCapacity);
    const tierCost = round2(unitsInThisTier * tier.ratePerUnit);

    tiers.push({
      tierOrder: tier.tierOrder,
      minUnits: tier.minUnits,
      maxUnits: tier.maxUnits,
      unitsInTier: round2(unitsInThisTier),
      ratePerUnit: tier.ratePerUnit,
      tierCost,
    });

    energyCharges = round2(energyCharges + tierCost);
    remainingUnits -= unitsInThisTier;
  }

  const fixedCharges = round2(tariff.fixedChargeMonthly);
  const meterRent = round2(tariff.meterRentMonthly);

  // Utility-specific surcharges
  let sewerageCharge = 0;
  if (tariff.utilityType === 'WATER' && tariff.sewerageRatePercent > 0) {
    sewerageCharge = round2((energyCharges * tariff.sewerageRatePercent) / 100);
  }

  let fuelSurcharge = 0;
  if (tariff.utilityType === 'ELECTRICITY' && tariff.fuelSurchargeRate > 0) {
    // ₹ per kWh fuel adjustment charge (FAC)
    fuelSurcharge = round2(units * tariff.fuelSurchargeRate);
  }

  // Subtotal before tax
  const subtotalBeforeTax = round2(
    fixedCharges + meterRent + energyCharges + sewerageCharge + fuelSurcharge
  );

  // Tax duty
  const taxCharges = round2((subtotalBeforeTax * tariff.taxRatePercent) / 100);

  // Rebate / Early bird discount (e.g. 1% if prompt payment eligible)
  let rebateDiscount = 0;
  if (promptPaymentEligible) {
    rebateDiscount = round2(energyCharges * 0.015); // 1.5% prompt rebate on consumption
  }

  const totalPayable = round2(
    subtotalBeforeTax + taxCharges - rebateDiscount
  );

  // Generate structured line items
  const lineItems: DetailedBillCalculation['lineItems'] = [];
  let order = 1;

  lineItems.push({
    category: 'FIXED',
    description: `Standard Monthly Fixed Standing Charge`,
    amount: fixedCharges,
    orderIndex: order++,
  });

  if (meterRent > 0) {
    lineItems.push({
      category: 'METER_RENT',
      description: `Meter Service & Maintenance Fee`,
      amount: meterRent,
      orderIndex: order++,
    });
  }

  for (const t of tiers) {
    if (t.unitsInTier > 0) {
      const slabLabel = t.maxUnits !== null
        ? `Consumption Slab ${t.tierOrder} (${t.minUnits}-${t.maxUnits} units @ ₹${t.ratePerUnit.toFixed(2)}/unit)`
        : `Consumption Slab ${t.tierOrder} (> ${t.minUnits} units @ ₹${t.ratePerUnit.toFixed(2)}/unit)`;
      lineItems.push({
        category: 'TIER_SLAB',
        description: slabLabel,
        quantity: t.unitsInTier,
        rate: t.ratePerUnit,
        amount: t.tierCost,
        orderIndex: order++,
      });
    }
  }

  if (fuelSurcharge > 0) {
    lineItems.push({
      category: 'SURCHARGE',
      description: `Fuel & Power Purchase Price Adjustment (FAC) @ ₹${tariff.fuelSurchargeRate.toFixed(2)}/unit`,
      quantity: units,
      rate: tariff.fuelSurchargeRate,
      amount: fuelSurcharge,
      orderIndex: order++,
    });
  }

  if (sewerageCharge > 0) {
    lineItems.push({
      category: 'SEWERAGE',
      description: `Municipal Sewerage & Sanitation Cess (${tariff.sewerageRatePercent}% on water volume charges)`,
      amount: sewerageCharge,
      orderIndex: order++,
    });
  }

  if (taxCharges > 0) {
    lineItems.push({
      category: 'TAX_DUTY',
      description: `Electricity/Water Duty & Local Surcharge (${tariff.taxRatePercent}%)`,
      amount: taxCharges,
      orderIndex: order++,
    });
  }

  if (rebateDiscount > 0) {
    lineItems.push({
      category: 'REBATE',
      description: `Prompt Payment Digital Settlement Rebate`,
      amount: -rebateDiscount,
      orderIndex: order++,
    });
  }

  return {
    utilityType: tariff.utilityType,
    unitsConsumed: units,
    fixedCharges,
    energyCharges,
    meterRent,
    sewerageCharge,
    fuelSurcharge,
    taxCharges,
    rebateDiscount,
    totalPayable,
    tiers,
    lineItems,
  };
}

export interface BillComparisonInput {
  currentBill: {
    billNumber: string;
    utilityType: UtilityType;
    totalAmountDue: number;
    unitsConsumed: number;
    fixedCharges: number;
    energyCharges: number;
    taxCharges: number;
    otherCharges: number;
    rebateDiscount: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
  };
  previousBill?: {
    billNumber: string;
    totalAmountDue: number;
    unitsConsumed: number;
    fixedCharges: number;
    energyCharges: number;
    taxCharges: number;
    otherCharges: number;
    rebateDiscount: number;
    billingPeriodStart: string;
    billingPeriodEnd: string;
  } | null;
}

/**
 * Computes comparative bill analysis, plain-language breakdown and verified recommendations
 */
export function compareBills(input: BillComparisonInput): BillComparisonResult {
  const { currentBill, previousBill } = input;
  const currency = '₹';

  if (!previousBill) {
    return {
      hasPreviousBill: false,
      currency,
      previousBillAmount: null,
      currentBillAmount: round2(currentBill.totalAmountDue),
      absoluteChange: null,
      percentageChange: null,
      unitsChange: null,
      previousUnits: null,
      currentUnits: round2(currentBill.unitsConsumed),
      categoryDifferences: {
        fixedChargesChange: 0,
        consumptionChargesChange: 0,
        taxesSurchargesChange: 0,
        rebatesChange: 0,
      },
      largestContributors: [],
      plainLanguageSummary: `This is your initial bill for this billing connection or previous historical bill data is not yet recorded. Comparative variance cannot be calculated without verified previous billing records.`,
      actionableRecommendations: generateSavingTips(currentBill.utilityType, currentBill.unitsConsumed, 0),
    };
  }

  const prevAmount = round2(previousBill.totalAmountDue);
  const currAmount = round2(currentBill.totalAmountDue);
  const absoluteChange = round2(currAmount - prevAmount);
  const percentageChange = prevAmount > 0 
    ? round2(((currAmount - prevAmount) / prevAmount) * 100) 
    : 0;

  const prevUnits = round2(previousBill.unitsConsumed);
  const currUnits = round2(currentBill.unitsConsumed);
  const unitsChange = round2(currUnits - prevUnits);

  const fixedDiff = round2(currentBill.fixedCharges - previousBill.fixedCharges);
  const energyDiff = round2(currentBill.energyCharges - previousBill.energyCharges);
  const taxesDiff = round2((currentBill.taxCharges + currentBill.otherCharges) - (previousBill.taxCharges + previousBill.otherCharges));
  const rebatesDiff = round2(previousBill.rebateDiscount - currentBill.rebateDiscount); // positive if rebate lost

  // Identify largest contributors to the difference
  const contributors: Array<{ category: string; difference: number; explanation: string }> = [];

  if (Math.abs(energyDiff) > 0.01) {
    contributors.push({
      category: currentBill.utilityType === 'ELECTRICITY' ? 'Electricity Consumption' : 'Water Volume Used',
      difference: energyDiff,
      explanation: energyDiff > 0
        ? `Usage increased by ${Math.abs(unitsChange)} units, adding ${currency}${Math.abs(energyDiff)} to your variable consumption charge.`
        : `Usage decreased by ${Math.abs(unitsChange)} units, saving ${currency}${Math.abs(energyDiff)} in consumption charges.`,
    });
  }

  if (Math.abs(fixedDiff) > 0.01) {
    contributors.push({
      category: 'Fixed Standing Charges',
      difference: fixedDiff,
      explanation: fixedDiff > 0
        ? `Fixed standing charges increased by ${currency}${Math.abs(fixedDiff)} due to sanctioned tariff adjustment.`
        : `Fixed standing charges decreased by ${currency}${Math.abs(fixedDiff)}.`,
    });
  }

  if (Math.abs(taxesDiff) > 0.01) {
    contributors.push({
      category: 'Taxes, Duties & Surcharges',
      difference: taxesDiff,
      explanation: taxesDiff > 0
        ? `Taxes and municipal surcharges increased by ${currency}${Math.abs(taxesDiff)} proportionally with higher subtotal charges.`
        : `Taxes and duties decreased by ${currency}${Math.abs(taxesDiff)}.`,
    });
  }

  if (Math.abs(rebatesDiff) > 0.01) {
    contributors.push({
      category: 'Rebates & Discounts',
      difference: rebatesDiff,
      explanation: rebatesDiff > 0
        ? `Rebate discount was ${currency}${Math.abs(rebatesDiff)} lower than previous cycle.`
        : `Received ${currency}${Math.abs(rebatesDiff)} higher prompt rebate discount.`,
    });
  }

  // Sort by highest absolute difference
  contributors.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  const totalAbsDiff = contributors.reduce((acc, c) => acc + Math.abs(c.difference), 0) || 1;
  const verifiedContributors = contributors.map(c => ({
    ...c,
    percentageOfChange: round2((Math.abs(c.difference) / totalAbsDiff) * 100),
  }));

  // Build Plain-language deterministic summary
  let plainLanguageSummary = '';
  const utilityNoun = currentBill.utilityType === 'ELECTRICITY' ? 'electricity' : 'water';
  const unitsLabel = currentBill.utilityType === 'ELECTRICITY' ? 'kWh units' : 'kL (kiloliter) units';

  if (absoluteChange > 0) {
    plainLanguageSummary = `Your ${utilityNoun} bill increased by ${currency}${Math.abs(absoluteChange)} (${percentageChange > 0 ? `+${percentageChange}%` : `${percentageChange}%`}) compared with the previous billing period. `;
    if (unitsChange > 0) {
      plainLanguageSummary += `Consumption increased by ${Math.abs(unitsChange)} ${unitsLabel}, contributing ${currency}${Math.abs(energyDiff)} to the increase. `;
    } else if (unitsChange < 0) {
      plainLanguageSummary += `Consumption actually decreased by ${Math.abs(unitsChange)} ${unitsLabel}, but tariff or fixed charges adjusted the total. `;
    } else {
      plainLanguageSummary += `Consumption remained identical at ${currUnits} ${unitsLabel}. `;
    }
    if (fixedDiff > 0) plainLanguageSummary += `Fixed standing charges increased by ${currency}${fixedDiff}. `;
    if (taxesDiff > 0) plainLanguageSummary += `Taxes and municipal duties increased by ${currency}${taxesDiff}. `;
  } else if (absoluteChange < 0) {
    plainLanguageSummary = `Your ${utilityNoun} bill decreased by ${currency}${Math.abs(absoluteChange)} (${percentageChange}%) compared with the previous billing period. `;
    if (unitsChange < 0) {
      plainLanguageSummary += `Consumption decreased by ${Math.abs(unitsChange)} ${unitsLabel}, reducing consumption charges by ${currency}${Math.abs(energyDiff)}. `;
    }
    if (taxesDiff < 0) plainLanguageSummary += `Associated duties and taxes dropped by ${currency}${Math.abs(taxesDiff)}. `;
  } else {
    plainLanguageSummary = `Your ${utilityNoun} bill is exactly equal to the previous period at ${currency}${currAmount}. `;
  }

  const actionableRecommendations = generateSavingTips(
    currentBill.utilityType,
    currUnits,
    unitsChange
  );

  return {
    hasPreviousBill: true,
    currency,
    previousBillAmount: prevAmount,
    currentBillAmount: currAmount,
    absoluteChange,
    percentageChange,
    unitsChange,
    previousUnits: prevUnits,
    currentUnits: currUnits,
    categoryDifferences: {
      fixedChargesChange: fixedDiff,
      consumptionChargesChange: energyDiff,
      taxesSurchargesChange: taxesDiff,
      rebatesChange: rebatesDiff,
    },
    largestContributors: verifiedContributors,
    plainLanguageSummary: plainLanguageSummary.trim(),
    actionableRecommendations,
  };
}

function generateSavingTips(utilityType: UtilityType, currentUnits: number, unitsChange: number): string[] {
  const tips: string[] = [];

  if (utilityType === 'ELECTRICITY') {
    if (currentUnits > 300) {
      tips.push('High slab tariff alert: Your consumption crossed 300 kWh, shifting usage into the highest ₹7.50/kWh rate tier. Reducing 30 units next cycle can lower you to a cheaper tier.');
    }
    if (unitsChange > 20) {
      tips.push('Your usage jumped significantly vs last month. Check cooling appliances (air conditioners, refrigerators), water heaters, or heavy electronics for timer or thermostat drift.');
    }
    tips.push('Shift high-power appliance operation (washing machine, iron, EV charging) away from peak evening hours (6:00 PM – 10:00 PM) where peak time-of-day tariffs apply.');
    tips.push('Unplug standby appliances and electronic adapters when not in active use to prevent phantom standby power draw (typically 5–10% of residential power).');
  } else {
    if (currentUnits > 25) {
      tips.push('High water tier threshold: Usage exceeded 25 kL, triggering higher volumetric and municipal sewerage charges. Inspect overhead tank float valves and garden taps.');
    }
    if (unitsChange > 5) {
      tips.push('Unusual water increase detected (+ ' + unitsChange + ' kL). Perform a meter leak check: shut off all household fixtures for 30 minutes and verify whether the meter dial moves.');
    }
    tips.push('Install low-flow aerators on kitchen and bathroom taps to reduce volumetric flow by up to 35% without losing water pressure.');
    tips.push('Ensure toilet flush cistern valves seat securely; a silent flapper leak can waste up to 200 liters of water per day.');
  }

  return tips;
}
