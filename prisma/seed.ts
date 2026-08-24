/**
 * Development seed data for F Net Water Hub.
 *
 * DEVELOPMENT ONLY. Every account below uses the same well-known password and
 * must never exist in a production database. See README.md for the credential
 * table and the warning that accompanies it.
 *
 * The data is deliberately *consistent* rather than merely plentiful:
 *   - stock positions equal the sum of the inventory movements that created them
 *   - order totals equal subtotal + delivery fee − discount
 *   - amountPaid on an order equals the successful payments recorded against it
 *   - a customer's bottle balance equals the sum of their bottle ledger
 *   - a reward balance equals the sum of the reward ledger
 *
 * That way the dashboards, reconciliation screens and reports all agree with
 * one another from the first run, and a broken invariant in application code
 * shows up immediately instead of hiding behind implausible fixtures.
 */

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../lib/generated/prisma/client";
import {
  AddressType,
  BottleLedgerEntryType,
  BottleState,
  DeliveryFailureReason,
  DeliveryStatus,
  DispenserOwnership,
  DispenserStatus,
  InstallmentFrequency,
  InstallmentPlanStatus,
  InstallmentStatus,
  InventoryMovementType,
  MaintenanceStatus,
  NotificationCategory,
  NotificationSeverity,
  OrderPaymentStatus,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentPurpose,
  PaymentStatus,
  ProductType,
  ReferralStatus,
  RewardLedgerType,
  SettingValueType,
  StockHolderType,
  TrackerAlertType,
  TransactionStatus,
  TransactionType,
  UserRole,
  UserStatus,
} from "../lib/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env before seeding.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Shared across every demo account. Development only.
 *
 * Overridable via SEED_DEFAULT_PASSWORD so a developer is not forced to use a
 * password that their own environment's policy tooling might flag.
 */
const DEMO_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "Password123!";

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY);
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

/** Today at a given hour, for scheduling deliveries within the working day. */
function todayAt(hour: number, minute = 0): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

/**
 * Deletes existing rows in dependency order.
 *
 * Re-running the seed must produce the same database rather than a second copy
 * of every ledger entry, and ledger tables are append-only in application code
 * so there is no "update instead" path.
 */
async function reset(): Promise<void> {
  await prisma.$transaction([
    prisma.trackerAlert.deleteMany(),
    prisma.trackerReading.deleteMany(),
    prisma.trackerDevice.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.storedFile.deleteMany(),
    prisma.rewardLedger.deleteMany(),
    prisma.rewardRedemption.deleteMany(),
    prisma.customerRewardBalance.deleteMany(),
    prisma.referral.deleteMany(),
    prisma.paymentTransaction.deleteMany(),
    prisma.customerBottleLedger.deleteMany(),
    prisma.customerBottleBalance.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.dispenserInstallment.deleteMany(),
    prisma.dispenserPaymentPlan.deleteMany(),
    prisma.dispenserInstallation.deleteMany(),
    prisma.dispenser.deleteMany(),
    prisma.inventoryMovement.deleteMany(),
    prisma.inventoryAdjustment.deleteMany(),
    prisma.bottleStockPosition.deleteMany(),
    prisma.deliveryStatusHistory.deleteMany(),
    prisma.delivery.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.address.deleteMany(),
    prisma.product.deleteMany(),
    prisma.systemSetting.deleteMany(),
    prisma.session.deleteMany(),
    prisma.customerProfile.deleteMany(),
    prisma.driverProfile.deleteMany(),
    prisma.agentProfile.deleteMany(),
    prisma.staffProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

// --- Settings --------------------------------------------------------------

/**
 * Business rules live in the database so an administrator can change them
 * without a deployment (requirements §21). The values mirror `lib/settings`
 * DEFAULTS; that module remains the fallback when a row is absent.
 */
const SETTINGS: {
  key: string;
  value: unknown;
  valueType: SettingValueType;
  category: string;
  label: string;
  description: string;
}[] = [
  {
    key: "referral.successful_required_for_reward",
    value: 5,
    valueType: SettingValueType.NUMBER,
    category: "referrals",
    label: "Successful referrals per reward",
    description:
      "How many successful referrals earn one free water bottle. The approved rule is 5.",
  },
  {
    key: "referral.reward_product_sku",
    value: "RB-18L",
    valueType: SettingValueType.STRING,
    category: "referrals",
    label: "Reward product",
    description: "SKU of the product issued as the free-bottle reward.",
  },
  {
    key: "referral.qualifying_min_order_total",
    value: "0.00",
    valueType: SettingValueType.DECIMAL,
    category: "referrals",
    label: "Minimum qualifying order total",
    description:
      "Minimum paid order total before a referral counts as successful.",
  },
  {
    key: "bottle.shortage_charge_per_unit",
    value: "80.00",
    valueType: SettingValueType.DECIMAL,
    category: "bottles",
    label: "Bottle shortage charge",
    description:
      "Amount charged per unreturned refillable bottle when management converts a shortage into a charge.",
  },
  {
    key: "bottle.shortage_grace_days",
    value: 14,
    valueType: SettingValueType.NUMBER,
    category: "bottles",
    label: "Shortage follow-up window (days)",
    description:
      "Days an outstanding bottle shortage may age before it is flagged for follow-up.",
  },
  {
    key: "bottle.auto_charge_shortage",
    value: false,
    valueType: SettingValueType.BOOLEAN,
    category: "bottles",
    label: "Automatically charge shortages",
    description:
      "When off, staff decide explicitly whether an unreturned bottle becomes a charge.",
  },
  {
    key: "order.cancellation_allowed_statuses",
    value: ["PENDING", "CONFIRMED", "PROCESSING"],
    valueType: SettingValueType.JSON,
    category: "orders",
    label: "Customer-cancellable statuses",
    description:
      "Order statuses a customer may cancel from. Delivered orders can never be cancelled.",
  },
  {
    key: "order.default_delivery_fee",
    value: "10.00",
    valueType: SettingValueType.DECIMAL,
    category: "orders",
    label: "Default delivery fee",
    description: "Delivery fee applied to new orders.",
  },
  {
    key: "dispenser.installment_frequency_default",
    value: "MONTHLY",
    valueType: SettingValueType.STRING,
    category: "dispensers",
    label: "Default installment frequency",
    description: "Payment cadence applied to new dispenser payment plans.",
  },
  {
    key: "dispenser.overdue_grace_days",
    value: 3,
    valueType: SettingValueType.NUMBER,
    category: "dispensers",
    label: "Overdue grace period (days)",
    description: "Days past the due date before an installment is marked overdue.",
  },
  {
    key: "dispenser.due_soon_days",
    value: 5,
    valueType: SettingValueType.NUMBER,
    category: "dispensers",
    label: "Due-soon lead time (days)",
    description: "How far ahead an upcoming installment is flagged as due soon.",
  },
  {
    key: "dispenser.ownership_requires_approval",
    value: true,
    valueType: SettingValueType.BOOLEAN,
    category: "dispensers",
    label: "Ownership transfer requires approval",
    description:
      "A fully paid dispenser becomes eligible for transfer, but an authorized user must approve it.",
  },
  {
    key: "inventory.adjustment_admin_threshold",
    value: 50,
    valueType: SettingValueType.NUMBER,
    category: "inventory",
    label: "Administrator approval threshold",
    description:
      "Stock adjustments larger than this magnitude require administrator authorization.",
  },
  {
    key: "inventory.low_stock_threshold",
    value: 100,
    valueType: SettingValueType.NUMBER,
    category: "inventory",
    label: "Low stock alert level",
    description: "Filled-bottle level that raises a manager alert.",
  },
  {
    key: "payment.cod_enabled",
    value: true,
    valueType: SettingValueType.BOOLEAN,
    category: "payments",
    label: "Cash on delivery enabled",
    description: "Whether customers may choose to pay the driver on delivery.",
  },
  {
    key: "agent.commission_rate",
    value: "0.0250",
    valueType: SettingValueType.DECIMAL,
    category: "agents",
    label: "Default agent commission rate",
    description:
      "Fraction of order value credited to the registering agent. Demo value only.",
  },
  {
    key: "tracker.low_water_level_percent",
    value: 20,
    valueType: SettingValueType.NUMBER,
    category: "trackers",
    label: "Low water level alert (%)",
    description: "Water level below which a tracker raises a low-level alert.",
  },
];

async function main(): Promise<void> {
  console.log("Resetting existing data…");
  await reset();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  console.log("Seeding system settings…");
  await prisma.systemSetting.createMany({
    data: SETTINGS.map((setting) => ({
      key: setting.key,
      value: setting.value as never,
      valueType: setting.valueType,
      category: setting.category,
      label: setting.label,
      description: setting.description,
    })),
  });

  // --- Staff ---------------------------------------------------------------

  console.log("Seeding staff accounts…");

  const admin = await prisma.user.create({
    data: {
      code: "FNW-A-000001",
      email: "admin@fnetwaterhub.com",
      phone: "0244000001",
      passwordHash,
      fullName: "Emmanuel Mensah",
      role: UserRole.ADMINISTRATOR,
      status: UserStatus.ACTIVE,
      staffProfile: {
        create: {
          staffCode: "STF-0001",
          department: "Executive",
          jobTitle: "System Administrator",
        },
      },
    },
  });

  const manager = await prisma.user.create({
    data: {
      code: "FNW-M-000002",
      email: "manager@fnetwaterhub.com",
      phone: "0244000002",
      passwordHash,
      fullName: "Abena Owusu",
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      createdById: admin.id,
      staffProfile: {
        create: {
          staffCode: "STF-0002",
          department: "Operations",
          jobTitle: "Operations Manager",
        },
      },
    },
  });

  const agentUsers = await Promise.all(
    [
      {
        code: "FNW-A-000003",
        email: "agent@fnetwaterhub.com",
        phone: "0244000003",
        fullName: "Kwabena Asante",
        agentCode: "AGT-0001",
        region: "Greater Accra",
      },
      {
        code: "FNW-A-000004",
        email: "agent2@fnetwaterhub.com",
        phone: "0244000004",
        fullName: "Yaa Boateng",
        agentCode: "AGT-0002",
        region: "Ashanti",
      },
    ].map((agent) =>
      prisma.user.create({
        data: {
          code: agent.code,
          email: agent.email,
          phone: agent.phone,
          passwordHash,
          fullName: agent.fullName,
          role: UserRole.AGENT,
          status: UserStatus.ACTIVE,
          createdById: admin.id,
          agentProfile: {
            create: {
              agentCode: agent.agentCode,
              region: agent.region,
              commissionRate: "0.0250",
            },
          },
        },
        include: { agentProfile: true },
      }),
    ),
  );

  const driverUsers = await Promise.all(
    [
      {
        code: "FNW-D-000005",
        email: "driver@fnetwaterhub.com",
        phone: "0244000005",
        fullName: "David Mensah",
        driverCode: "DRV-0001",
        vehicleRegistration: "GT-4821-24",
        vehicleType: "Kia Bongo pickup",
      },
      {
        code: "FNW-D-000006",
        email: "driver2@fnetwaterhub.com",
        phone: "0244000006",
        fullName: "Isaac Ampofo",
        driverCode: "DRV-0002",
        vehicleRegistration: "GR-1190-23",
        vehicleType: "Nissan Urvan",
      },
      {
        code: "FNW-D-000007",
        email: "driver3@fnetwaterhub.com",
        phone: "0244000007",
        fullName: "Samuel Tetteh",
        driverCode: "DRV-0003",
        vehicleRegistration: "GX-7702-22",
        vehicleType: "Tricycle",
      },
    ].map((driver) =>
      prisma.user.create({
        data: {
          code: driver.code,
          email: driver.email,
          phone: driver.phone,
          passwordHash,
          fullName: driver.fullName,
          role: UserRole.DRIVER,
          status: UserStatus.ACTIVE,
          createdById: admin.id,
          driverProfile: {
            create: {
              driverCode: driver.driverCode,
              licenseNumber: `GHA-DL-${driver.driverCode.slice(-4)}`,
              vehicleRegistration: driver.vehicleRegistration,
              vehicleType: driver.vehicleType,
            },
          },
        },
        include: { driverProfile: true },
      }),
    ),
  );

  const [agentOne, agentTwo] = agentUsers;
  const [driverOne, driverTwo, driverThree] = driverUsers;

  // --- Products ------------------------------------------------------------

  console.log("Seeding products…");

  const products = await Promise.all(
    [
      {
        sku: "RB-18L",
        name: "Refillable Bottle 18L",
        description:
          "Standard 18-litre refillable water bottle for home and office dispensers.",
        type: ProductType.REFILLABLE_BOTTLE,
        unitPrice: "20.00",
        unit: "bottle",
        capacityLitres: "18.00",
        requiresBottleExchange: true,
        isRewardEligible: true,
        lowStockThreshold: 100,
        sortOrder: 1,
      },
      {
        sku: "RB-10L",
        name: "Refillable Bottle 10L",
        description: "Compact 10-litre refillable bottle for small households.",
        type: ProductType.REFILLABLE_BOTTLE,
        unitPrice: "14.00",
        unit: "bottle",
        capacityLitres: "10.00",
        requiresBottleExchange: true,
        isRewardEligible: true,
        lowStockThreshold: 60,
        sortOrder: 2,
      },
      {
        sku: "TA-500ML-P15",
        name: "Take-Away Water 500ml (pack of 15)",
        description: "Sealed 500ml sachets, sold by the pack. No bottle return.",
        type: ProductType.TAKEAWAY_BOTTLE,
        unitPrice: "18.00",
        unit: "pack",
        capacityLitres: "7.50",
        requiresBottleExchange: false,
        isRewardEligible: false,
        lowStockThreshold: 40,
        sortOrder: 3,
      },
      {
        sku: "TA-1500ML-P12",
        name: "Take-Away Water 1.5L (pack of 12)",
        description: "Sealed 1.5-litre bottles, sold by the pack.",
        type: ProductType.TAKEAWAY_BOTTLE,
        unitPrice: "42.00",
        unit: "pack",
        capacityLitres: "18.00",
        requiresBottleExchange: false,
        isRewardEligible: false,
        lowStockThreshold: 30,
        sortOrder: 4,
      },
      {
        sku: "BULK-1000L",
        name: "Bulk Water Supply 1000L",
        description: "Tanker delivery for construction sites and events.",
        type: ProductType.BULK_WATER,
        unitPrice: "260.00",
        unit: "1000 litres",
        capacityLitres: "1000.00",
        requiresBottleExchange: false,
        isRewardEligible: false,
        sortOrder: 5,
      },
      {
        sku: "DISP-STD",
        name: "Standard Water Dispenser",
        description: "Hot and cold floor-standing dispenser.",
        type: ProductType.DISPENSER,
        unitPrice: "1800.00",
        unit: "unit",
        requiresBottleExchange: false,
        isRewardEligible: false,
        sortOrder: 6,
      },
    ].map((product) => prisma.product.create({ data: product })),
  );

  const bySku = new Map(products.map((product) => [product.sku, product]));
  const refill18 = bySku.get("RB-18L")!;
  const refill10 = bySku.get("RB-10L")!;
  const takeaway500 = bySku.get("TA-500ML-P15")!;
  const bulk = bySku.get("BULK-1000L")!;

  // --- Customers -----------------------------------------------------------

  console.log("Seeding customers…");

  const customerSpecs = [
    {
      fullName: "Akosua Addo",
      email: "customer@fnetwaterhub.com",
      phone: "0201000001",
      gpsAddress: "GA-183-4567",
      addressLine: "12 Ring Road East",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Opposite Danquah Circle",
      latitude: "5.5717000",
      longitude: "-0.1869000",
      registeredByAgentId: agentOne.agentProfile!.id,
    },
    {
      fullName: "Kojo Ansah",
      email: "kojo.ansah@example.com",
      phone: "0201000002",
      gpsAddress: "GA-201-8891",
      addressLine: "4 Spintex Road",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Near Coca-Cola roundabout",
      latitude: "5.6270000",
      longitude: "-0.1140000",
      registeredByAgentId: agentOne.agentProfile!.id,
    },
    {
      fullName: "Ama Serwaa",
      email: "ama.serwaa@example.com",
      phone: "0201000003",
      gpsAddress: "AK-039-4412",
      addressLine: "18 Sunyani Road",
      city: "Kumasi",
      region: "Ashanti",
      landmark: "Behind Tech Junction",
      latitude: "6.6885000",
      longitude: "-1.6244000",
      registeredByAgentId: agentTwo.agentProfile!.id,
    },
    {
      fullName: "Kofi Asante",
      email: "kofi.asante@example.com",
      phone: "0201000004",
      gpsAddress: "GA-441-2093",
      addressLine: "7 Lagos Avenue",
      city: "Accra",
      region: "Greater Accra",
      landmark: "East Legon",
      latitude: "5.6350000",
      longitude: "-0.1600000",
      registeredByAgentId: null,
    },
    {
      fullName: "Akua Gyasi",
      email: "akua.gyasi@example.com",
      phone: "0201000005",
      gpsAddress: "GA-509-7712",
      addressLine: "22 Labone Crescent",
      city: "Accra",
      region: "Greater Accra",
      landmark: "Labone",
      latitude: "5.5680000",
      longitude: "-0.1750000",
      registeredByAgentId: null,
    },
    {
      fullName: "Yaw Boakye",
      email: "yaw.boakye@example.com",
      phone: "0201000006",
      gpsAddress: "GA-612-3390",
      addressLine: "3 Tema Station Road",
      city: "Tema",
      region: "Greater Accra",
      landmark: "Community 5",
      latitude: "5.6700000",
      longitude: "-0.0170000",
      registeredByAgentId: agentTwo.agentProfile!.id,
    },
  ];

  async function createCustomer(
    spec: (typeof customerSpecs)[number],
    sequence: number,
  ) {
    const user = await prisma.user.create({
      data: {
        code: `FNW-C-${String(sequence).padStart(6, "0")}`,
        email: spec.email,
        phone: spec.phone,
        passwordHash,
        fullName: spec.fullName,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        lastLoginAt: daysAgo(sequence),
        customerProfile: {
          create: {
            customerCode: `CUS-${String(sequence).padStart(6, "0")}`,
            referralCode: `FNET-DEMO${sequence}`,
            ghanaDigitalAddress: spec.gpsAddress,
            latitude: spec.latitude,
            longitude: spec.longitude,
            registeredByAgentId: spec.registeredByAgentId,
            // Balances exist from the start so later flows lock an existing
            // row instead of racing to create one.
            bottleBalance: { create: {} },
            rewardBalance: { create: {} },
            addresses: {
              create: {
                label: "Home",
                type: AddressType.HOME,
                contactName: spec.fullName,
                contactPhone: spec.phone,
                ghanaDigitalAddress: spec.gpsAddress,
                addressLine: spec.addressLine,
                city: spec.city,
                region: spec.region,
                landmark: spec.landmark,
                latitude: spec.latitude,
                longitude: spec.longitude,
                isDefault: true,
              },
            },
          },
        },
      },
      include: {
        customerProfile: { include: { addresses: true } },
      },
    });

    return {
      user,
      profile: user.customerProfile!,
      address: user.customerProfile!.addresses[0],
    };
  }

  type SeedCustomer = Awaited<ReturnType<typeof createCustomer>>;

  const customers: SeedCustomer[] = [];

  // Created sequentially so the customer codes stay deterministic.
  for (const [index, spec] of customerSpecs.entries()) {
    customers.push(await createCustomer(spec, index + 1));
  }

  const [akosua, kojo, ama, kofi, akua, yaw] = customers;

  // --- Inventory -----------------------------------------------------------

  console.log("Seeding inventory ledger and stock positions…");

  /**
   * Every stock figure below is created by a movement first, then materialised
   * into a position. The position is a cache for fast reads and row locking —
   * the ledger is the source of truth.
   */
  const openingStock: {
    product: { id: string };
    state: BottleState;
    holderType: StockHolderType;
    holderId: string;
    quantity: number;
    movementType: InventoryMovementType;
    reason: string;
  }[] = [
    {
      product: refill18,
      state: BottleState.FILLED_WAREHOUSE,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 1_240,
      movementType: InventoryMovementType.REFILL_PRODUCTION,
      reason: "Opening stock — production run",
    },
    {
      product: refill10,
      state: BottleState.FILLED_WAREHOUSE,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 610,
      movementType: InventoryMovementType.REFILL_PRODUCTION,
      reason: "Opening stock — production run",
    },
    {
      product: refill18,
      state: BottleState.EMPTY_WAREHOUSE,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 980,
      movementType: InventoryMovementType.EMPTY_RETURNED,
      reason: "Opening stock — empties awaiting refill",
    },
    {
      product: refill10,
      state: BottleState.EMPTY_WAREHOUSE,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 520,
      movementType: InventoryMovementType.EMPTY_RETURNED,
      reason: "Opening stock — empties awaiting refill",
    },
    {
      product: takeaway500,
      state: BottleState.FILLED_WAREHOUSE,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 340,
      movementType: InventoryMovementType.REFILL_PRODUCTION,
      reason: "Opening stock — packs received",
    },
    {
      product: refill18,
      state: BottleState.DAMAGED,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 87,
      movementType: InventoryMovementType.BOTTLE_DAMAGED,
      reason: "Cracked necks identified during inspection",
    },
    {
      product: refill18,
      state: BottleState.LOST,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 24,
      movementType: InventoryMovementType.BOTTLE_LOST,
      reason: "Unaccounted after Q1 stock count",
    },
    {
      product: refill18,
      state: BottleState.UNDER_INVESTIGATION,
      holderType: StockHolderType.WAREHOUSE,
      holderId: "",
      quantity: 12,
      movementType: InventoryMovementType.ADJUSTMENT,
      reason: "Discrepancy pending investigation",
    },
  ];

  let movementSequence = 0;

  async function recordMovement(input: {
    productId: string;
    movementType: InventoryMovementType;
    quantity: number;
    fromState?: BottleState;
    toState?: BottleState;
    driverId?: string;
    customerId?: string;
    orderId?: string;
    deliveryId?: string;
    reason: string;
    occurredAt?: Date;
    performedByUserId?: string;
  }) {
    movementSequence += 1;

    return prisma.inventoryMovement.create({
      data: {
        reference: `MOV-SEED-${String(movementSequence).padStart(5, "0")}`,
        movementType: input.movementType,
        productId: input.productId,
        quantity: input.quantity,
        fromState: input.fromState,
        toState: input.toState,
        driverId: input.driverId,
        customerId: input.customerId,
        orderId: input.orderId,
        deliveryId: input.deliveryId,
        performedByUserId: input.performedByUserId ?? manager.id,
        reason: input.reason,
        occurredAt: input.occurredAt ?? new Date(),
      },
    });
  }

  async function setPosition(input: {
    productId: string;
    state: BottleState;
    holderType: StockHolderType;
    holderId: string;
    quantity: number;
  }) {
    await prisma.bottleStockPosition.upsert({
      where: {
        productId_state_holderType_holderId: {
          productId: input.productId,
          state: input.state,
          holderType: input.holderType,
          holderId: input.holderId,
        },
      },
      create: input,
      update: { quantity: input.quantity },
    });
  }

  for (const entry of openingStock) {
    await recordMovement({
      productId: entry.product.id,
      movementType: entry.movementType,
      quantity: entry.quantity,
      toState: entry.state,
      reason: entry.reason,
      occurredAt: daysAgo(30),
      performedByUserId: admin.id,
    });

    await setPosition({
      productId: entry.product.id,
      state: entry.state,
      holderType: entry.holderType,
      holderId: entry.holderId,
      quantity: entry.quantity,
    });
  }

  // --- Orders and deliveries ----------------------------------------------

  console.log("Seeding orders, deliveries and bottle exchanges…");

  type SeedItem = {
    product: (typeof products)[number];
    quantity: number;
  };

  /** The transitions an order passes through on its way to `target`. */
  function progressionTo(target: OrderStatus): OrderStatus[] {
    const pipeline = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.ASSIGNED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ];

    if (target === OrderStatus.PENDING) return [];

    // A cancellation and a failed delivery leave the pipeline rather than
    // completing it, so neither passes through DELIVERED.
    if (target === OrderStatus.CANCELLED) {
      return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED];
    }

    if (target === OrderStatus.FAILED) {
      return [...pipeline.slice(0, -1), OrderStatus.FAILED];
    }

    return pipeline.slice(0, pipeline.indexOf(target) + 1);
  }

  /**
   * Creates an order with its items, computed totals and status history.
   * Totals are computed here rather than hard-coded so the seeded data cannot
   * drift from the arithmetic the application performs.
   */
  async function createOrder(input: {
    customer: (typeof customers)[number];
    items: SeedItem[];
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    source?: OrderSource;
    placedByUserId?: string;
    deliveryFee?: string;
    discountTotal?: string;
    amountPaid?: string;
    scheduledFor?: Date | null;
    createdAt: Date;
    confirmedAt?: Date | null;
    deliveredAt?: Date | null;
    cancelledAt?: Date | null;
    cancellationReason?: string;
    orderNumber: string;
  }) {
    const subtotalPesewas = input.items.reduce(
      (total, item) =>
        total + Math.round(Number(item.product.unitPrice) * 100) * item.quantity,
      0,
    );
    const feePesewas = Math.round(Number(input.deliveryFee ?? "10.00") * 100);
    const discountPesewas = Math.round(Number(input.discountTotal ?? "0.00") * 100);
    const totalPesewas = subtotalPesewas + feePesewas - discountPesewas;

    const toAmount = (pesewas: number) => (pesewas / 100).toFixed(2);

    // Only refillable products create an empty-return obligation.
    const expectedEmptyBottles = input.items
      .filter((item) => item.product.requiresBottleExchange)
      .reduce((total, item) => total + item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: input.orderNumber,
        customerId: input.customer.profile.id,
        addressId: input.customer.address.id,
        status: input.status,
        paymentStatus: input.paymentStatus,
        source: input.source ?? OrderSource.CUSTOMER_WEB,
        placedByUserId: input.placedByUserId ?? input.customer.user.id,
        subtotal: toAmount(subtotalPesewas),
        deliveryFee: toAmount(feePesewas),
        discountTotal: toAmount(discountPesewas),
        total: toAmount(totalPesewas),
        amountPaid: input.amountPaid ?? "0.00",
        expectedEmptyBottles,
        scheduledFor: input.scheduledFor ?? null,
        createdAt: input.createdAt,
        confirmedAt: input.confirmedAt ?? null,
        deliveredAt: input.deliveredAt ?? null,
        cancelledAt: input.cancelledAt ?? null,
        cancellationReason: input.cancellationReason,
        items: {
          create: input.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.unitPrice.toString(),
            lineTotal: toAmount(
              Math.round(Number(item.product.unitPrice) * 100) * item.quantity,
            ),
            requiresBottleExchange: item.product.requiresBottleExchange,
          })),
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: OrderStatus.PENDING,
            changedByUserId: input.placedByUserId ?? input.customer.user.id,
            reason: "Order placed",
            createdAt: input.createdAt,
          },
        },
      },
      include: { items: true },
    });

    // Walk the real workflow to the target status, so the history reads as a
    // plausible trail rather than a single jump.
    const progression = progressionTo(input.status);

    let previous: OrderStatus = OrderStatus.PENDING;
    let offset = 1;

    for (const next of progression) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: previous,
          toStatus: next,
          changedByUserId: manager.id,
          createdAt: new Date(input.createdAt.getTime() + offset * 3_600_000),
        },
      });

      previous = next;
      offset += 1;
    }

    return order;
  }

  // 1. Delivered order with a bottle shortage: 5 out, 4 empties back.
  const deliveredOrder = await createOrder({
    customer: akosua,
    items: [{ product: refill18, quantity: 5 }],
    status: OrderStatus.DELIVERED,
    paymentStatus: OrderPaymentStatus.PAID,
    amountPaid: "110.00",
    createdAt: daysAgo(6),
    confirmedAt: daysAgo(6),
    deliveredAt: daysAgo(5),
    scheduledFor: daysAgo(5),
    orderNumber: "ORD-DEMO-000001",
  });

  const deliveredDelivery = await prisma.delivery.create({
    data: {
      deliveryNumber: "DEL-DEMO-000001",
      orderId: deliveredOrder.id,
      driverId: driverOne.driverProfile!.id,
      status: DeliveryStatus.DELIVERED,
      scheduledFor: daysAgo(5),
      assignedAt: daysAgo(6),
      dispatchedAt: daysAgo(5),
      completedAt: daysAgo(5),
      bottlesDispatched: 5,
      bottlesDelivered: 5,
      emptyBottlesExpected: 5,
      emptyBottlesCollected: 4,
      shortageQuantity: 1,
      cashCollected: "110.00",
      remarks: "Customer had one bottle at a relative's house.",
      addressSnapshot: {
        addressLine: akosua.address.addressLine,
        city: akosua.address.city,
        ghanaDigitalAddress: akosua.address.ghanaDigitalAddress,
      },
      statusHistory: {
        create: [
          {
            toStatus: DeliveryStatus.ASSIGNED,
            changedByUserId: manager.id,
            createdAt: daysAgo(6),
          },
          {
            fromStatus: DeliveryStatus.ASSIGNED,
            toStatus: DeliveryStatus.OUT_FOR_DELIVERY,
            changedByUserId: driverOne.id,
            createdAt: daysAgo(5),
          },
          {
            fromStatus: DeliveryStatus.OUT_FOR_DELIVERY,
            toStatus: DeliveryStatus.DELIVERED,
            changedByUserId: driverOne.id,
            createdAt: daysAgo(5),
          },
        ],
      },
    },
  });

  // The movement chain for that delivery: warehouse → driver → customer, then
  // the empties that came back.
  await recordMovement({
    productId: refill18.id,
    movementType: InventoryMovementType.FILLED_DISPATCHED,
    quantity: 5,
    fromState: BottleState.FILLED_WAREHOUSE,
    toState: BottleState.ASSIGNED_TO_DRIVER,
    driverId: driverOne.driverProfile!.id,
    orderId: deliveredOrder.id,
    deliveryId: deliveredDelivery.id,
    reason: "Loaded for delivery",
    occurredAt: daysAgo(5),
  });

  await recordMovement({
    productId: refill18.id,
    movementType: InventoryMovementType.MOVED_TO_CUSTOMER,
    quantity: 5,
    fromState: BottleState.ASSIGNED_TO_DRIVER,
    toState: BottleState.WITH_CUSTOMER,
    driverId: driverOne.driverProfile!.id,
    customerId: akosua.profile.id,
    orderId: deliveredOrder.id,
    deliveryId: deliveredDelivery.id,
    reason: "Delivered to customer",
    occurredAt: daysAgo(5),
    performedByUserId: driverOne.id,
  });

  await recordMovement({
    productId: refill18.id,
    movementType: InventoryMovementType.EMPTY_COLLECTED,
    quantity: 4,
    fromState: BottleState.WITH_CUSTOMER,
    toState: BottleState.EMPTY_WAREHOUSE,
    driverId: driverOne.driverProfile!.id,
    customerId: akosua.profile.id,
    orderId: deliveredOrder.id,
    deliveryId: deliveredDelivery.id,
    reason: "Empties collected on delivery",
    occurredAt: daysAgo(5),
    performedByUserId: driverOne.id,
  });

  // Bottle accountability: the ledger records the obligation, and the balance
  // is the sum of the ledger — 5 delivered, 4 returned, 1 outstanding.
  await prisma.customerBottleLedger.createMany({
    data: [
      {
        customerId: akosua.profile.id,
        entryType: BottleLedgerEntryType.SHORTAGE_RECORDED,
        quantity: 5,
        deliveryId: deliveredDelivery.id,
        orderId: deliveredOrder.id,
        performedByUserId: driverOne.id,
        reason: "5 filled bottles delivered; 5 empties expected",
        createdAt: daysAgo(5),
      },
      {
        customerId: akosua.profile.id,
        entryType: BottleLedgerEntryType.RETURNED,
        quantity: -4,
        deliveryId: deliveredDelivery.id,
        orderId: deliveredOrder.id,
        performedByUserId: driverOne.id,
        reason: "4 empties collected at the door",
        createdAt: daysAgo(5),
      },
    ],
  });

  await prisma.customerBottleBalance.update({
    where: { customerId: akosua.profile.id },
    data: {
      bottlesHeld: 1,
      outstandingShortage: 1,
      lifetimeShortage: 5,
      lifetimeReturned: 4,
    },
  });

  await setPosition({
    productId: refill18.id,
    state: BottleState.WITH_CUSTOMER,
    holderType: StockHolderType.CUSTOMER,
    holderId: akosua.profile.id,
    quantity: 1,
  });

  // Cash on delivery for that order, with its ledger entry.
  const codPayment = await prisma.payment.create({
    data: {
      reference: "PAY-DEMO-000001",
      customerId: akosua.profile.id,
      purpose: PaymentPurpose.ORDER,
      orderId: deliveredOrder.id,
      deliveryId: deliveredDelivery.id,
      amount: "110.00",
      method: PaymentMethod.CASH,
      provider: "manual",
      status: PaymentStatus.SUCCESSFUL,
      collectedByUserId: driverOne.id,
      confirmedByUserId: manager.id,
      confirmedAt: daysAgo(5),
      notes: "Cash collected on delivery and reconciled the same day.",
      createdAt: daysAgo(5),
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      paymentId: codPayment.id,
      type: TransactionType.PAYMENT,
      amount: "110.00",
      status: TransactionStatus.SUCCESSFUL,
      performedByUserId: driverOne.id,
      reason: "Cash on delivery",
      createdAt: daysAgo(5),
    },
  });

  // 2. Failed delivery awaiting reconciliation — stock is still with the driver.
  const failedOrder = await createOrder({
    customer: kojo,
    items: [{ product: refill18, quantity: 3 }],
    status: OrderStatus.FAILED,
    paymentStatus: OrderPaymentStatus.UNPAID,
    createdAt: daysAgo(2),
    confirmedAt: daysAgo(2),
    scheduledFor: daysAgo(1),
    orderNumber: "ORD-DEMO-000002",
  });

  const failedDelivery = await prisma.delivery.create({
    data: {
      deliveryNumber: "DEL-DEMO-000002",
      orderId: failedOrder.id,
      driverId: driverTwo.driverProfile!.id,
      status: DeliveryStatus.FAILED,
      scheduledFor: daysAgo(1),
      assignedAt: daysAgo(2),
      dispatchedAt: daysAgo(1),
      failedAt: daysAgo(1),
      failureReason: DeliveryFailureReason.CUSTOMER_UNAVAILABLE,
      failureNotes: "Nobody at the premises; phone rang out on three attempts.",
      bottlesDispatched: 3,
      bottlesDelivered: 0,
      emptyBottlesExpected: 3,
      // Left true deliberately: the three filled bottles are still on the
      // vehicle and must be returned to the warehouse by an authorized user.
      requiresReconciliation: true,
      statusHistory: {
        create: [
          {
            toStatus: DeliveryStatus.ASSIGNED,
            changedByUserId: manager.id,
            createdAt: daysAgo(2),
          },
          {
            fromStatus: DeliveryStatus.ASSIGNED,
            toStatus: DeliveryStatus.OUT_FOR_DELIVERY,
            changedByUserId: driverTwo.id,
            createdAt: daysAgo(1),
          },
          {
            fromStatus: DeliveryStatus.OUT_FOR_DELIVERY,
            toStatus: DeliveryStatus.FAILED,
            changedByUserId: driverTwo.id,
            reason: "Customer unavailable",
            createdAt: daysAgo(1),
          },
        ],
      },
    },
  });

  await recordMovement({
    productId: refill18.id,
    movementType: InventoryMovementType.FILLED_DISPATCHED,
    quantity: 3,
    fromState: BottleState.FILLED_WAREHOUSE,
    toState: BottleState.ASSIGNED_TO_DRIVER,
    driverId: driverTwo.driverProfile!.id,
    orderId: failedOrder.id,
    deliveryId: failedDelivery.id,
    reason: "Loaded for delivery",
    occurredAt: daysAgo(1),
  });

  await setPosition({
    productId: refill18.id,
    state: BottleState.ASSIGNED_TO_DRIVER,
    holderType: StockHolderType.DRIVER,
    holderId: driverTwo.driverProfile!.id,
    quantity: 3,
  });

  // 3. Out for delivery right now, cash due on arrival.
  const activeOrder = await createOrder({
    customer: ama,
    items: [
      { product: refill18, quantity: 2 },
      { product: takeaway500, quantity: 1 },
    ],
    status: OrderStatus.OUT_FOR_DELIVERY,
    paymentStatus: OrderPaymentStatus.UNPAID,
    createdAt: daysAgo(1),
    confirmedAt: daysAgo(1),
    scheduledFor: todayAt(14),
    orderNumber: "ORD-DEMO-000003",
  });

  const activeDelivery = await prisma.delivery.create({
    data: {
      deliveryNumber: "DEL-DEMO-000003",
      orderId: activeOrder.id,
      driverId: driverOne.driverProfile!.id,
      status: DeliveryStatus.OUT_FOR_DELIVERY,
      scheduledFor: todayAt(14),
      assignedAt: daysAgo(1),
      dispatchedAt: todayAt(9),
      bottlesDispatched: 2,
      emptyBottlesExpected: 2,
      statusHistory: {
        create: [
          {
            toStatus: DeliveryStatus.ASSIGNED,
            changedByUserId: manager.id,
            createdAt: daysAgo(1),
          },
          {
            fromStatus: DeliveryStatus.ASSIGNED,
            toStatus: DeliveryStatus.OUT_FOR_DELIVERY,
            changedByUserId: driverOne.id,
            createdAt: todayAt(9),
          },
        ],
      },
    },
  });

  await recordMovement({
    productId: refill18.id,
    movementType: InventoryMovementType.FILLED_DISPATCHED,
    quantity: 2,
    fromState: BottleState.FILLED_WAREHOUSE,
    toState: BottleState.IN_TRANSIT,
    driverId: driverOne.driverProfile!.id,
    orderId: activeOrder.id,
    deliveryId: activeDelivery.id,
    reason: "Loaded for today's round",
    occurredAt: todayAt(9),
  });

  await setPosition({
    productId: refill18.id,
    state: BottleState.IN_TRANSIT,
    holderType: StockHolderType.DRIVER,
    holderId: driverOne.driverProfile!.id,
    quantity: 2,
  });

  // 4. Assigned but not yet dispatched, scheduled for later today.
  const assignedOrder = await createOrder({
    customer: kofi,
    items: [{ product: refill10, quantity: 4 }],
    status: OrderStatus.ASSIGNED,
    paymentStatus: OrderPaymentStatus.PAID,
    amountPaid: "66.00",
    createdAt: daysAgo(1),
    confirmedAt: daysAgo(1),
    scheduledFor: todayAt(16, 30),
    orderNumber: "ORD-DEMO-000004",
  });

  await prisma.delivery.create({
    data: {
      deliveryNumber: "DEL-DEMO-000004",
      orderId: assignedOrder.id,
      driverId: driverThree.driverProfile!.id,
      status: DeliveryStatus.ASSIGNED,
      scheduledFor: todayAt(16, 30),
      assignedAt: daysAgo(1),
      bottlesDispatched: 0,
      emptyBottlesExpected: 4,
      statusHistory: {
        create: {
          toStatus: DeliveryStatus.ASSIGNED,
          changedByUserId: manager.id,
          createdAt: daysAgo(1),
        },
      },
    },
  });

  const mobileMoneyPayment = await prisma.payment.create({
    data: {
      reference: "PAY-DEMO-000002",
      customerId: kofi.profile.id,
      purpose: PaymentPurpose.ORDER,
      orderId: assignedOrder.id,
      amount: "66.00",
      method: PaymentMethod.MTN_MOBILE_MONEY,
      provider: "manual",
      status: PaymentStatus.SUCCESSFUL,
      providerReference: "MM-DEMO-77120",
      confirmedByUserId: manager.id,
      confirmedAt: daysAgo(1),
      notes: "Mobile money transfer confirmed by operations.",
      createdAt: daysAgo(1),
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      paymentId: mobileMoneyPayment.id,
      type: TransactionType.PAYMENT,
      amount: "66.00",
      status: TransactionStatus.SUCCESSFUL,
      performedByUserId: manager.id,
      reason: "Mobile money payment confirmed",
      createdAt: daysAgo(1),
    },
  });

  // 5. Awaiting a driver: an agent placed this on the customer's behalf.
  const pendingOrder = await createOrder({
    customer: yaw,
    items: [{ product: bulk, quantity: 2 }],
    status: OrderStatus.CONFIRMED,
    paymentStatus: OrderPaymentStatus.PARTIALLY_PAID,
    amountPaid: "200.00",
    source: OrderSource.AGENT,
    placedByUserId: agentTwo.id,
    deliveryFee: "40.00",
    createdAt: daysAgo(1),
    confirmedAt: daysAgo(1),
    scheduledFor: daysFromNow(1),
    orderNumber: "ORD-DEMO-000005",
  });

  await prisma.delivery.create({
    data: {
      deliveryNumber: "DEL-DEMO-000005",
      orderId: pendingOrder.id,
      status: DeliveryStatus.PENDING,
      scheduledFor: daysFromNow(1),
      statusHistory: {
        create: {
          toStatus: DeliveryStatus.PENDING,
          changedByUserId: agentTwo.id,
          createdAt: daysAgo(1),
        },
      },
    },
  });

  const partPayment = await prisma.payment.create({
    data: {
      reference: "PAY-DEMO-000003",
      customerId: yaw.profile.id,
      purpose: PaymentPurpose.ORDER,
      orderId: pendingOrder.id,
      amount: "200.00",
      method: PaymentMethod.BANK_TRANSFER,
      provider: "manual",
      status: PaymentStatus.SUCCESSFUL,
      providerReference: "BT-DEMO-40021",
      confirmedByUserId: manager.id,
      confirmedAt: daysAgo(1),
      notes: "Deposit against a bulk supply order.",
      createdAt: daysAgo(1),
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      paymentId: partPayment.id,
      type: TransactionType.PAYMENT,
      amount: "200.00",
      status: TransactionStatus.SUCCESSFUL,
      performedByUserId: manager.id,
      reason: "Bank deposit confirmed",
      createdAt: daysAgo(1),
    },
  });

  // 6. A cancelled order, so the cancellation path has data behind it.
  await createOrder({
    customer: akua,
    items: [{ product: takeaway500, quantity: 3 }],
    status: OrderStatus.CANCELLED,
    paymentStatus: OrderPaymentStatus.UNPAID,
    createdAt: daysAgo(4),
    confirmedAt: daysAgo(4),
    cancelledAt: daysAgo(4),
    cancellationReason: "Customer travelled unexpectedly.",
    orderNumber: "ORD-DEMO-000006",
  });

  // 7. A reversed payment: the original entry stays, a negative entry corrects
  //    it. Financial history is never deleted (requirements §19).
  const reversedOrder = await createOrder({
    customer: akua,
    items: [{ product: refill18, quantity: 2 }],
    status: OrderStatus.CONFIRMED,
    paymentStatus: OrderPaymentStatus.UNPAID,
    createdAt: daysAgo(3),
    confirmedAt: daysAgo(3),
    scheduledFor: daysFromNow(2),
    orderNumber: "ORD-DEMO-000007",
  });

  const reversedPayment = await prisma.payment.create({
    data: {
      reference: "PAY-DEMO-000004",
      customerId: akua.profile.id,
      purpose: PaymentPurpose.ORDER,
      orderId: reversedOrder.id,
      amount: "50.00",
      method: PaymentMethod.TELECEL_CASH,
      provider: "manual",
      status: PaymentStatus.REVERSED,
      providerReference: "TC-DEMO-99814",
      confirmedByUserId: manager.id,
      confirmedAt: daysAgo(3),
      notes: "Recorded against the wrong order; reversed the same day.",
      createdAt: daysAgo(3),
    },
  });

  await prisma.paymentTransaction.createMany({
    data: [
      {
        paymentId: reversedPayment.id,
        type: TransactionType.PAYMENT,
        amount: "50.00",
        status: TransactionStatus.SUCCESSFUL,
        performedByUserId: manager.id,
        reason: "Telecel Cash payment recorded",
        createdAt: daysAgo(3),
      },
      {
        paymentId: reversedPayment.id,
        type: TransactionType.REVERSAL,
        amount: "-50.00",
        status: TransactionStatus.SUCCESSFUL,
        performedByUserId: admin.id,
        reason: "Applied to the wrong order — reversed, not deleted",
        createdAt: daysAgo(3),
      },
    ],
  });

  // --- Dispensers ----------------------------------------------------------

  console.log("Seeding dispensers, payment plans and installments…");

  const installedDispenser = await prisma.dispenser.create({
    data: {
      assetTag: "DSP-0001",
      serialNumber: "SN-FNW-000001",
      model: "AquaCool Standard",
      status: DispenserStatus.INSTALLED,
      // Ownership stays with the company while the plan runs. Installing a unit
      // at a customer's premises transfers nothing.
      ownership: DispenserOwnership.COMPANY_OWNED_INSTALLMENT,
      maintenanceStatus: MaintenanceStatus.OK,
      customerId: akosua.profile.id,
      addressId: akosua.address.id,
      purchaseCost: "1200.00",
      salePrice: "1800.00",
      installedAt: daysAgo(120),
      installations: {
        create: {
          customerId: akosua.profile.id,
          addressId: akosua.address.id,
          installedAt: daysAgo(120),
          installedByUserId: driverOne.id,
          notes: "Installed in the ground-floor kitchen.",
        },
      },
    },
  });

  // 1800 total, 300 deposit, 12 × 125 = 1500. Four paid → 800 outstanding.
  const plan = await prisma.dispenserPaymentPlan.create({
    data: {
      planNumber: "PLN-DEMO-000001",
      dispenserId: installedDispenser.id,
      customerId: akosua.profile.id,
      totalCost: "1800.00",
      initialPayment: "300.00",
      installmentAmount: "125.00",
      frequency: InstallmentFrequency.MONTHLY,
      totalInstallments: 12,
      amountPaid: "800.00",
      outstandingBalance: "1000.00",
      status: InstallmentPlanStatus.ACTIVE,
      startDate: daysAgo(120),
      nextPaymentDate: daysFromNow(4),
    },
  });

  for (let sequence = 1; sequence <= 12; sequence += 1) {
    const paid = sequence <= 4;
    const dueDate = new Date(daysAgo(120).getTime() + sequence * 30 * DAY);

    await prisma.dispenserInstallment.create({
      data: {
        planId: plan.id,
        sequence,
        dueDate,
        amountDue: "125.00",
        amountPaid: paid ? "125.00" : "0.00",
        status: paid
          ? InstallmentStatus.PAID
          : sequence === 5
            ? InstallmentStatus.DUE_SOON
            : InstallmentStatus.PENDING,
        paidAt: paid ? dueDate : null,
      },
    });
  }

  const paidInstallments = await prisma.dispenserInstallment.findMany({
    where: { planId: plan.id, status: InstallmentStatus.PAID },
    orderBy: { sequence: "asc" },
  });

  // The deposit plus four installments: 300 + 4 × 125 = 800, matching the plan.
  const depositPayment = await prisma.payment.create({
    data: {
      reference: "PAY-DEMO-000005",
      customerId: akosua.profile.id,
      purpose: PaymentPurpose.DISPENSER_INSTALLMENT,
      planId: plan.id,
      amount: "300.00",
      method: PaymentMethod.BANK_TRANSFER,
      provider: "manual",
      status: PaymentStatus.SUCCESSFUL,
      confirmedByUserId: manager.id,
      confirmedAt: daysAgo(120),
      notes: "Initial deposit on the dispenser plan.",
      createdAt: daysAgo(120),
    },
  });

  await prisma.paymentTransaction.create({
    data: {
      paymentId: depositPayment.id,
      type: TransactionType.PAYMENT,
      amount: "300.00",
      status: TransactionStatus.SUCCESSFUL,
      performedByUserId: manager.id,
      reason: "Dispenser plan deposit",
      createdAt: daysAgo(120),
    },
  });

  for (const [index, installment] of paidInstallments.entries()) {
    const payment = await prisma.payment.create({
      data: {
        reference: `PAY-DEMO-00000${6 + index}`,
        customerId: akosua.profile.id,
        purpose: PaymentPurpose.DISPENSER_INSTALLMENT,
        planId: plan.id,
        installmentId: installment.id,
        amount: "125.00",
        method: PaymentMethod.MTN_MOBILE_MONEY,
        provider: "manual",
        status: PaymentStatus.SUCCESSFUL,
        providerReference: `MM-DEMO-INST-${installment.sequence}`,
        confirmedByUserId: manager.id,
        confirmedAt: installment.dueDate,
        createdAt: installment.dueDate,
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        type: TransactionType.PAYMENT,
        amount: "125.00",
        status: TransactionStatus.SUCCESSFUL,
        performedByUserId: manager.id,
        reason: `Installment ${installment.sequence} of 12`,
        createdAt: installment.dueDate,
      },
    });
  }

  // An overdue plan, so the collections view has something to work with.
  const overdueDispenser = await prisma.dispenser.create({
    data: {
      assetTag: "DSP-0002",
      serialNumber: "SN-FNW-000002",
      model: "AquaCool Compact",
      status: DispenserStatus.INSTALLED,
      ownership: DispenserOwnership.COMPANY_OWNED_INSTALLMENT,
      maintenanceStatus: MaintenanceStatus.OK,
      customerId: ama.profile.id,
      addressId: ama.address.id,
      purchaseCost: "900.00",
      salePrice: "1400.00",
      installedAt: daysAgo(90),
      installations: {
        create: {
          customerId: ama.profile.id,
          addressId: ama.address.id,
          installedAt: daysAgo(90),
          installedByUserId: driverTwo.id,
        },
      },
    },
  });

  const overduePlan = await prisma.dispenserPaymentPlan.create({
    data: {
      planNumber: "PLN-DEMO-000002",
      dispenserId: overdueDispenser.id,
      customerId: ama.profile.id,
      totalCost: "1400.00",
      initialPayment: "200.00",
      installmentAmount: "100.00",
      frequency: InstallmentFrequency.MONTHLY,
      totalInstallments: 12,
      amountPaid: "400.00",
      outstandingBalance: "1000.00",
      status: InstallmentPlanStatus.OVERDUE,
      startDate: daysAgo(90),
      nextPaymentDate: daysAgo(12),
    },
  });

  for (let sequence = 1; sequence <= 12; sequence += 1) {
    const dueDate = new Date(daysAgo(90).getTime() + sequence * 30 * DAY);
    const paid = sequence <= 2;
    const overdue = sequence === 3;

    await prisma.dispenserInstallment.create({
      data: {
        planId: overduePlan.id,
        sequence,
        dueDate,
        amountDue: "100.00",
        amountPaid: paid ? "100.00" : "0.00",
        status: paid
          ? InstallmentStatus.PAID
          : overdue
            ? InstallmentStatus.OVERDUE
            : InstallmentStatus.PENDING,
        paidAt: paid ? dueDate : null,
        overdueDays: overdue ? 12 : 0,
      },
    });
  }

  // Stock of uninstalled units, plus one faulty unit awaiting repair.
  await prisma.dispenser.createMany({
    data: [
      {
        assetTag: "DSP-0003",
        serialNumber: "SN-FNW-000003",
        model: "AquaCool Standard",
        status: DispenserStatus.AVAILABLE,
        ownership: DispenserOwnership.COMPANY_OWNED,
        purchaseCost: "1200.00",
        salePrice: "1800.00",
      },
      {
        assetTag: "DSP-0004",
        serialNumber: "SN-FNW-000004",
        model: "AquaCool Compact",
        status: DispenserStatus.AVAILABLE,
        ownership: DispenserOwnership.COMPANY_OWNED,
        purchaseCost: "900.00",
        salePrice: "1400.00",
      },
      {
        assetTag: "DSP-0005",
        serialNumber: "SN-FNW-000005",
        model: "AquaCool Standard",
        status: DispenserStatus.FAULTY,
        ownership: DispenserOwnership.COMPANY_OWNED,
        maintenanceStatus: MaintenanceStatus.FAULT_REPORTED,
        purchaseCost: "1200.00",
        salePrice: "1800.00",
        notes: "Compressor failure reported by the customer; retrieved for repair.",
      },
      {
        assetTag: "DSP-0006",
        serialNumber: "SN-FNW-000006",
        model: "AquaCool Compact",
        status: DispenserStatus.INSTALLED,
        // Fully paid and formally approved, so ownership has moved.
        ownership: DispenserOwnership.CUSTOMER_OWNED,
        customerId: kofi.profile.id,
        addressId: kofi.address.id,
        purchaseCost: "900.00",
        salePrice: "1400.00",
        installedAt: daysAgo(400),
      },
    ],
  });

  // --- Referrals and rewards ----------------------------------------------

  console.log("Seeding referrals and rewards…");

  /**
   * Akosua referred five customers who all completed a paid order, which under
   * the configured rule (5 successful referrals = 1 reward) earns exactly one
   * free bottle. The reward is a ledger entry; the balance is its sum.
   */
  const referredCustomers = [kojo, ama, kofi, akua, yaw];

  const referrals = [];

  for (const [index, referred] of referredCustomers.entries()) {
    const referral = await prisma.referral.create({
      data: {
        code: akosua.profile.referralCode,
        referrerCustomerId: akosua.profile.id,
        referredCustomerId: referred.profile.id,
        agentId:
          referred.profile.registeredByAgentId ?? null,
        status: ReferralStatus.QUALIFIED,
        qualifiedAt: daysAgo(20 - index * 2),
        createdAt: daysAgo(25 - index * 2),
      },
    });

    referrals.push(referral);
  }

  await prisma.rewardLedger.create({
    data: {
      customerId: akosua.profile.id,
      type: RewardLedgerType.EARNED,
      quantity: 1,
      referralId: referrals[referrals.length - 1].id,
      reason: "5 successful referrals reached",
      createdAt: daysAgo(12),
    },
  });

  await prisma.customerRewardBalance.update({
    where: { customerId: akosua.profile.id },
    data: { earned: 1, available: 1 },
  });

  // A referral still waiting on its qualifying paid order.
  await prisma.referral.create({
    data: {
      code: kojo.profile.referralCode,
      referrerCustomerId: kojo.profile.id,
      referredCustomerId: akosua.profile.id,
      status: ReferralStatus.PENDING,
      createdAt: daysAgo(3),
    },
  });

  // --- Trackers ------------------------------------------------------------

  console.log("Seeding simulated tracker devices…");

  /**
   * Phase 1 ships no IoT hardware. These devices are flagged `isSimulated` so
   * no screen can present them as live telemetry.
   */
  const onlineDevice = await prisma.trackerDevice.create({
    data: {
      deviceCode: "TRK-DEMO-0001",
      dispenserId: installedDispenser.id,
      simNumber: "0555000001",
      isSimulated: true,
      isOnline: true,
      batteryPercent: 82,
      waterLevelPercent: 64,
      latitude: akosua.address.latitude?.toString(),
      longitude: akosua.address.longitude?.toString(),
      lastRefillAt: daysAgo(5),
      lastSeenAt: new Date(),
    },
  });

  const offlineDevice = await prisma.trackerDevice.create({
    data: {
      deviceCode: "TRK-DEMO-0002",
      dispenserId: overdueDispenser.id,
      simNumber: "0555000002",
      isSimulated: true,
      isOnline: false,
      batteryPercent: 11,
      waterLevelPercent: 14,
      latitude: ama.address.latitude?.toString(),
      longitude: ama.address.longitude?.toString(),
      lastRefillAt: daysAgo(19),
      lastSeenAt: daysAgo(2),
    },
  });

  await prisma.trackerReading.createMany({
    data: Array.from({ length: 14 }).flatMap((_, index) => [
      {
        deviceId: onlineDevice.id,
        recordedAt: daysAgo(13 - index),
        waterLevelPercent: Math.max(20, 95 - index * 2),
        dailyUsageLitres: "18.00",
        batteryPercent: Math.max(60, 96 - index),
        isOnline: true,
      },
      {
        deviceId: offlineDevice.id,
        recordedAt: daysAgo(13 - index),
        waterLevelPercent: Math.max(10, 80 - index * 5),
        dailyUsageLitres: "12.50",
        batteryPercent: Math.max(11, 70 - index * 4),
        isOnline: index < 12,
      },
    ]),
  });

  await prisma.trackerAlert.createMany({
    data: [
      {
        deviceId: offlineDevice.id,
        type: TrackerAlertType.LOW_WATER_LEVEL,
        severity: NotificationSeverity.WARNING,
        message: "Water level at 14% — below the 20% alert threshold.",
        createdAt: daysAgo(2),
      },
      {
        deviceId: offlineDevice.id,
        type: TrackerAlertType.DEVICE_OFFLINE,
        severity: NotificationSeverity.CRITICAL,
        message: "No signal for 48 hours. Battery was 11% when last seen.",
        createdAt: daysAgo(1),
      },
    ],
  });

  // --- Notifications -------------------------------------------------------

  console.log("Seeding notifications…");

  await prisma.notification.createMany({
    data: [
      {
        userId: akosua.user.id,
        category: NotificationCategory.DELIVERY,
        severity: NotificationSeverity.SUCCESS,
        title: "Delivery completed",
        body: "5 bottles delivered and 4 empties collected. 1 bottle is still outstanding.",
        entityType: "Delivery",
        entityId: deliveredDelivery.id,
        actionUrl: "/customer/deliveries",
        sentAt: daysAgo(5),
        createdAt: daysAgo(5),
      },
      {
        userId: akosua.user.id,
        category: NotificationCategory.BOTTLE,
        severity: NotificationSeverity.WARNING,
        title: "1 bottle outstanding",
        body: "Please have the empty bottle ready for your next delivery.",
        actionUrl: "/customer/bottles",
        sentAt: daysAgo(5),
        createdAt: daysAgo(5),
      },
      {
        userId: akosua.user.id,
        category: NotificationCategory.REWARD,
        severity: NotificationSeverity.SUCCESS,
        title: "You earned a free bottle",
        body: "Five of your referrals completed a paid order. One free 18L bottle is available to redeem.",
        actionUrl: "/customer/rewards",
        sentAt: daysAgo(12),
        createdAt: daysAgo(12),
      },
      {
        userId: akosua.user.id,
        category: NotificationCategory.DISPENSER,
        severity: NotificationSeverity.INFO,
        title: "Dispenser payment due soon",
        body: "Your next installment of GH₵ 125.00 is due in 4 days.",
        actionUrl: "/customer/dispensers",
        sentAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        userId: driverOne.id,
        category: NotificationCategory.DELIVERY,
        severity: NotificationSeverity.INFO,
        title: "New delivery assigned",
        body: "Delivery DEL-DEMO-000003 to Ama Serwaa, scheduled for 2:00 PM.",
        entityType: "Delivery",
        entityId: activeDelivery.id,
        actionUrl: "/driver",
        sentAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        userId: driverTwo.id,
        category: NotificationCategory.DELIVERY,
        severity: NotificationSeverity.WARNING,
        title: "Return stock to the warehouse",
        body: "3 filled bottles from the failed delivery DEL-DEMO-000002 are still on your vehicle.",
        entityType: "Delivery",
        entityId: failedDelivery.id,
        actionUrl: "/driver",
        sentAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        userId: manager.id,
        category: NotificationCategory.DELIVERY,
        severity: NotificationSeverity.WARNING,
        title: "Failed delivery needs reconciliation",
        body: "DEL-DEMO-000002 failed — customer unavailable. 3 bottles await return to stock.",
        entityType: "Delivery",
        entityId: failedDelivery.id,
        actionUrl: "/manager/deliveries",
        sentAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        userId: manager.id,
        category: NotificationCategory.DISPENSER,
        severity: NotificationSeverity.WARNING,
        title: "Installment overdue",
        body: "Plan PLN-DEMO-000002 for Ama Serwaa is 12 days overdue.",
        actionUrl: "/manager/installments",
        sentAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        userId: admin.id,
        category: NotificationCategory.TRACKER,
        severity: NotificationSeverity.CRITICAL,
        title: "Tracker offline",
        body: "TRK-DEMO-0002 has not reported for 48 hours. Battery was 11%.",
        actionUrl: "/admin/trackers",
        sentAt: daysAgo(1),
        createdAt: daysAgo(1),
      },
      {
        userId: admin.id,
        category: NotificationCategory.PAYMENT,
        severity: NotificationSeverity.INFO,
        title: "Payment reversed",
        body: "PAY-DEMO-000004 was reversed: applied to the wrong order. The original entry is preserved.",
        actionUrl: "/admin/payments",
        sentAt: daysAgo(3),
        createdAt: daysAgo(3),
      },
      {
        userId: agentOne.id,
        category: NotificationCategory.REFERRAL,
        severity: NotificationSeverity.SUCCESS,
        title: "Referral qualified",
        body: "A customer you onboarded completed their first paid order.",
        actionUrl: "/agent/referrals",
        sentAt: daysAgo(20),
        createdAt: daysAgo(20),
      },
    ],
  });

  // --- Audit trail ---------------------------------------------------------

  console.log("Seeding audit trail…");

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "user.created",
        entityType: "User",
        entityId: manager.id,
        newValues: { role: UserRole.MANAGER, status: UserStatus.ACTIVE },
        reason: "Operations manager onboarded",
        createdAt: daysAgo(150),
      },
      {
        userId: admin.id,
        action: "payment.reversed",
        entityType: "Payment",
        entityId: reversedPayment.id,
        previousValues: { status: PaymentStatus.SUCCESSFUL },
        newValues: { status: PaymentStatus.REVERSED },
        reason: "Applied to the wrong order",
        createdAt: daysAgo(3),
      },
      {
        userId: manager.id,
        action: "delivery.failed",
        entityType: "Delivery",
        entityId: failedDelivery.id,
        newValues: {
          status: DeliveryStatus.FAILED,
          failureReason: DeliveryFailureReason.CUSTOMER_UNAVAILABLE,
          requiresReconciliation: true,
        },
        reason: "Reported by driver on site",
        createdAt: daysAgo(1),
      },
    ],
  });

  console.log("\nSeed complete.\n");
  console.log("Demo accounts — DEVELOPMENT ONLY.");
  console.log(`Password for every account below: ${DEMO_PASSWORD}\n`);
  console.table([
    { role: "Administrator", email: "admin@fnetwaterhub.com" },
    { role: "Manager", email: "manager@fnetwaterhub.com" },
    { role: "Agent", email: "agent@fnetwaterhub.com" },
    { role: "Agent", email: "agent2@fnetwaterhub.com" },
    { role: "Driver", email: "driver@fnetwaterhub.com" },
    { role: "Driver", email: "driver2@fnetwaterhub.com" },
    { role: "Driver", email: "driver3@fnetwaterhub.com" },
    { role: "Customer", email: "customer@fnetwaterhub.com" },
  ]);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
