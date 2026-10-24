import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with fictional demonstration data...');

  // Hash demo password
  const passwordHash = await bcrypt.hash('UtilityPass123!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', 10);

  // 1. Create Tariff Plans
  const electricityTariff = await prisma.tariffPlan.upsert({
    where: { code: 'T-ELEC-RES-2026' },
    update: {},
    create: {
      code: 'T-ELEC-RES-2026',
      utilityType: 'ELECTRICITY',
      name: 'Residential Domestic LT-2 (Demonstration)',
      fixedChargeMonthly: 120.00,
      meterRentMonthly: 30.00,
      taxRatePercent: 9.0,
      fuelSurchargeRate: 0.25,
      sewerageRatePercent: 0,
      effectiveFrom: new Date('2026-01-01'),
      description: 'Standard 4-tier progressive electricity tariff for residential households.',
      tiers: {
        create: [
          { tierOrder: 1, minUnits: 0, maxUnits: 100, ratePerUnit: 3.50 },
          { tierOrder: 2, minUnits: 100, maxUnits: 300, ratePerUnit: 5.20 },
          { tierOrder: 3, minUnits: 300, maxUnits: 500, ratePerUnit: 7.50 },
          { tierOrder: 4, minUnits: 500, maxUnits: null, ratePerUnit: 9.00 },
        ],
      },
    },
  });

  const waterTariff = await prisma.tariffPlan.upsert({
    where: { code: 'T-WATR-RES-2026' },
    update: {},
    create: {
      code: 'T-WATR-RES-2026',
      utilityType: 'WATER',
      name: 'Residential Potable Water BWSSB-1 (Demonstration)',
      fixedChargeMonthly: 80.00,
      meterRentMonthly: 25.00,
      taxRatePercent: 5.0,
      fuelSurchargeRate: 0,
      sewerageRatePercent: 20.0,
      effectiveFrom: new Date('2026-01-01'),
      description: 'Volumetric tiered water supply and municipal sewerage tariff.',
      tiers: {
        create: [
          { tierOrder: 1, minUnits: 0, maxUnits: 15, ratePerUnit: 8.00 },
          { tierOrder: 2, minUnits: 15, maxUnits: 30, ratePerUnit: 14.50 },
          { tierOrder: 3, minUnits: 30, maxUnits: null, ratePerUnit: 24.00 },
        ],
      },
    },
  });

  // 2. Create Users
  const priya = await prisma.user.upsert({
    where: { email: 'priya.sharma@example.com' },
    update: {},
    create: {
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma (Demo)',
      phone: '+91 98765 43210',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@utilityservice.gov' },
    update: {},
    create: {
      email: 'admin@utilityservice.gov',
      name: 'Chief Utility Administrator',
      phone: '+91 80222 33445',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Users & Tariffs seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
