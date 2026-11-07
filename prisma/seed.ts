import { PrismaClient, UserRole, UserStatus, OrderStatus, PaymentStatus, PaymentMethod, DispenserStatus, AddressType, ProductType, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding F Net Water Hub database with Ghana operational data...");

  // 1. Clean existing records in correct relation order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.bottleExchange.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.dispenserPayment.deleteMany();
  await prisma.dispenserPlan.deleteMany();
  await prisma.dispenser.deleteMany();
  await prisma.deliveryAddress.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.bottleInventory.deleteMany();

  // 2. Hash common test password
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("customer123", 10);

  // 3. Create Users for all 5 roles
  const admin = await prisma.user.create({
    data: {
      name: "Kwaku Frimpong (Admin)",
      email: "admin@fnetwater.com",
      phone: "0241000001",
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Emmanuel Mensah (Operations)",
      email: "manager@fnetwater.com",
      phone: "0241000002",
      password: hashedPassword,
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  const driver = await prisma.user.create({
    data: {
      name: "Kwame Asante (Fleet Driver)",
      email: "driver@fnetwater.com",
      phone: "0241000003",
      password: hashedPassword,
      role: UserRole.DRIVER,
      status: UserStatus.ACTIVE,
    },
  });

  const agent = await prisma.user.create({
    data: {
      name: "Abena Osei (Field Agent)",
      email: "agent@fnetwater.com",
      phone: "0241000004",
      password: hashedPassword,
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Kofi Boateng (Customer)",
      email: "customer@fnetwater.com",
      phone: "0241000005",
      password: userPassword,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
    },
  });

  // 4. Create Customer Profile
  const customerProfile = await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
      ghanaCardNumber: "GHA-721984210-4",
      customerCode: "CUST-1001",
      bottlesHeld: 4,
      freeBottleBalance: 1, // Has 1 free bottle reward
      referralCode: "FNET-KOFI-01",
    },
  });

  // 5. Create Delivery Addresses
  const homeAddress = await prisma.deliveryAddress.create({
    data: {
      customerProfileId: customerProfile.id,
      category: AddressType.HOME,
      areaName: "East Legon, Accra",
      digitalAddress: "GA-183-9021",
      gpsLatitude: 5.6358,
      gpsLongitude: -0.1585,
      deliveryInstructions: "Call upon arrival at the black security gate",
      isDefault: true,
    },
  });

  await prisma.deliveryAddress.create({
    data: {
      customerProfileId: customerProfile.id,
      category: AddressType.OFFICE,
      areaName: "Airport Residential Area, Accra",
      digitalAddress: "GA-019-3321",
      gpsLatitude: 5.6021,
      gpsLongitude: -0.1794,
      deliveryInstructions: "Leave with front desk reception",
      isDefault: false,
    },
  });

  // 6. Create Products
  const refillableBottle = await prisma.product.create({
    data: {
      name: "18.9L / 20L Refillable Water Bottle",
      type: ProductType.REFILLABLE_BOTTLE,
      description: "Premium purified mineral water bottle for dispensers. Requires empty bottle return or deposit.",
      price: 25.0, // GH₵ 25 per refill
      depositFee: 80.0, // GH₵ 80 initial bottle deposit if no exchange
      stockQuantity: 450,
      isActive: true,
    },
  });

  const takeawayPack = await prisma.product.create({
    data: {
      name: "Take-Away Bottled Water (Pack of 24 x 500ml)",
      type: ProductType.TAKEAWAY_BOTTLE,
      description: "Convenient shrink-wrapped pack of 500ml bottled water for home, events, and office meetings.",
      price: 35.0, // GH₵ 35 per pack
      depositFee: 0.0,
      stockQuantity: 280,
      isActive: true,
    },
  });

  await prisma.product.create({
    data: {
      name: "Commercial Bulk Water Supply (1000L)",
      type: ProductType.BULK_SUPPLY,
      description: "Dedicated commercial water tanker supply for storage tanks, institutions, and factories.",
      price: 450.0, // GH₵ 450 per 1000L
      depositFee: 0.0,
      stockQuantity: 40,
      isActive: true,
    },
  });

  // 7. Seed Initial Bottle Inventory Pool
  await prisma.bottleInventory.create({
    data: {
      filledWarehouse: 450,
      emptyWarehouse: 320,
      withCustomers: 1280,
      damaged: 18,
      lost: 6,
    },
  });

  // 8. Seed Dispenser & Installment Plan
  const dispenser = await prisma.dispenser.create({
    data: {
      serialNumber: "FNET-DSP-2026-081",
      modelName: "Floor Standing Hot & Cold Deluxe",
      status: DispenserStatus.INSTALLED_ON_PLAN,
      totalCost: 1800.0,
      customerProfileId: customerProfile.id,
      waterLevelPercent: 78,
      dailyUsageLiters: 16.5,
      batteryPercent: 92,
      isOnline: true,
      gpsLatitude: 5.6358,
      gpsLongitude: -0.1585,
      tamperAlert: false,
      maintenanceNotes: "Installed and working normally",
    },
  });

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const plan = await prisma.dispenserPlan.create({
    data: {
      dispenserId: dispenser.id,
      customerProfileId: customerProfile.id,
      totalCost: 1800.0,
      initialDeposit: 300.0,
      amountPaid: 600.0, // Initial deposit + 2 installments of 150
      outstandingBalance: 1200.0,
      monthlyDue: 150.0,
      nextPaymentDate: nextMonth,
      isFullyPaid: false,
    },
  });

  await prisma.dispenserPayment.create({
    data: {
      planId: plan.id,
      amount: 300.0,
      paymentMethod: PaymentMethod.PAYSTACK_MOMO,
      referenceCode: "PSTK-INST-001",
      paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.dispenserPayment.create({
    data: {
      planId: plan.id,
      amount: 150.0,
      paymentMethod: PaymentMethod.PAYSTACK_MOMO,
      referenceCode: "PSTK-INST-002",
      paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Seed Sample Order & Delivery
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "FNW-2026-1001",
      customerProfileId: customerProfile.id,
      deliveryAddressId: homeAddress.id,
      deliveryDate: new Date(),
      deliverySlot: "Morning (8am - 12pm)",
      deliveryInstructions: "Security code: 4921",
      subtotal: 50.0, // 2 refills @ 25
      depositFee: 0.0,
      deliveryFee: 15.0,
      discountAmount: 0.0,
      totalAmount: 65.0,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.PAYSTACK_MOMO,
      paymentReference: "PSTK-ORD-984210",
      freeBottlesRedeemed: 0,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      productId: refillableBottle.id,
      quantity: 2,
      unitPrice: 25.0,
      depositPrice: 0.0,
      totalPrice: 50.0,
    },
  });

  const sampleDelivery = await prisma.delivery.create({
    data: {
      orderId: sampleOrder.id,
      driverId: driver.id,
      assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: OrderStatus.DELIVERED,
      notes: "Delivered smoothly and bottles exchanged",
    },
  });

  await prisma.bottleExchange.create({
    data: {
      deliveryId: sampleDelivery.id,
      driverId: driver.id,
      customerId: customerProfile.id,
      filledDelivered: 2,
      emptyCollected: 2,
      damagedCount: 0,
      lostCount: 0,
      cashCollected: 0.0,
      customerNotes: "All bottles clean and sealed",
    },
  });

  // 10. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customerUser.id,
        role: UserRole.CUSTOMER,
        title: "Order Delivered Successfully",
        message: "Your water delivery for Order #FNW-2026-1001 has been completed.",
        type: NotificationType.SUCCESS,
        linkUrl: "/customer/orders",
      },
      {
        userId: admin.id,
        role: UserRole.ADMIN,
        title: "Daily Operations Ready",
        message: "F Net Water Hub Ghana system online. 450 filled bottles available.",
        type: NotificationType.INFO,
        linkUrl: "/admin/inventory",
      },
      {
        userId: manager.id,
        role: UserRole.MANAGER,
        title: "Driver Route Active",
        message: "Driver Kwame Asante has completed 1 delivery today.",
        type: NotificationType.INFO,
        linkUrl: "/manager/deliveries",
      },
    ],
  });

  console.log("Database seeded successfully with all 5 roles and Ghanaian water operations!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
