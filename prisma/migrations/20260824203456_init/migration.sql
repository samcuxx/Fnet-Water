-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'MANAGER', 'AGENT', 'DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'OFFICE', 'SHOP', 'SCHOOL', 'WAREHOUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeliveryInstruction" AS ENUM ('NONE', 'CALL_ON_ARRIVAL', 'LEAVE_AT_RECEPTION', 'DELIVER_TO_BACK_GATE', 'CONTACT_SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('REFILLABLE_BOTTLE', 'TAKEAWAY_BOTTLE', 'BULK_WATER', 'DISPENSER', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('CUSTOMER_WEB', 'AGENT', 'STAFF');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryFailureReason" AS ENUM ('CUSTOMER_UNAVAILABLE', 'CUSTOMER_CANCELLED', 'INCORRECT_LOCATION', 'UNABLE_TO_CONTACT', 'VEHICLE_PROBLEM', 'PAYMENT_ISSUE', 'INSUFFICIENT_STOCK', 'OTHER');

-- CreateEnum
CREATE TYPE "BottleState" AS ENUM ('FILLED_WAREHOUSE', 'EMPTY_WAREHOUSE', 'ASSIGNED_TO_DRIVER', 'IN_TRANSIT', 'WITH_CUSTOMER', 'DAMAGED', 'LOST', 'UNDER_INVESTIGATION');

-- CreateEnum
CREATE TYPE "StockHolderType" AS ENUM ('WAREHOUSE', 'DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('REFILL_PRODUCTION', 'FILLED_DISPATCHED', 'FILLED_DELIVERED', 'EMPTY_COLLECTED', 'EMPTY_RETURNED', 'MOVED_TO_CUSTOMER', 'RETURNED_FROM_CUSTOMER', 'BOTTLE_DAMAGED', 'BOTTLE_LOST', 'FAILED_DELIVERY_RETURN', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'APPLIED');

-- CreateEnum
CREATE TYPE "BottleLedgerEntryType" AS ENUM ('SHORTAGE_RECORDED', 'RETURNED', 'CHARGED', 'WRITTEN_OFF', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "DispenserStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'INSTALLED', 'UNDER_MAINTENANCE', 'FAULTY', 'RETRIEVED', 'RETIRED');

-- CreateEnum
CREATE TYPE "DispenserOwnership" AS ENUM ('COMPANY_OWNED', 'COMPANY_OWNED_INSTALLMENT', 'CUSTOMER_OWNED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OK', 'SERVICE_DUE', 'UNDER_REPAIR', 'FAULT_REPORTED');

-- CreateEnum
CREATE TYPE "InstallmentFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "InstallmentPlanStatus" AS ENUM ('PENDING', 'ACTIVE', 'DUE_SOON', 'OVERDUE', 'FULLY_PAID', 'SUSPENDED', 'DEFAULTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'DUE_SOON', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MTN_MOBILE_MONEY', 'TELECEL_CASH', 'AIRTELTIGO_MONEY', 'BANK_TRANSFER', 'CASH', 'CARD');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('ORDER', 'DISPENSER_INSTALLMENT', 'BOTTLE_CHARGE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PENDING_RECONCILIATION', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'REVERSED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'REVERSAL', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'QUALIFIED', 'REVERSED', 'INVALID');

-- CreateEnum
CREATE TYPE "RewardLedgerType" AS ENUM ('EARNED', 'REDEEMED', 'REVERSED', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('ORDER', 'DELIVERY', 'PAYMENT', 'DISPENSER', 'INVENTORY', 'REFERRAL', 'REWARD', 'BOTTLE', 'TRACKER', 'ACCOUNT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'EMAIL', 'WHATSAPP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TrackerAlertType" AS ENUM ('LOW_WATER_LEVEL', 'DISPENSER_RELOCATED', 'DEVICE_OFFLINE', 'MAINTENANCE_REQUIRED', 'TAMPERING');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'AUTHENTICATED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'NUMBER', 'DECIMAL', 'BOOLEAN', 'JSON');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "ghanaDigitalAddress" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "referralCode" TEXT NOT NULL,
    "registeredByAgentId" TEXT,
    "referredByCustomerId" TEXT,
    "takeawayBottlesBought" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "driverCode" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "vehicleRegistration" TEXT,
    "vehicleType" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentCode" TEXT NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "staffCode" TEXT NOT NULL,
    "department" TEXT,
    "jobTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'HOME',
    "contactName" TEXT,
    "contactPhone" TEXT,
    "ghanaDigitalAddress" TEXT,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "landmark" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "instruction" "DeliveryInstruction" NOT NULL DEFAULT 'NONE',
    "instructionNotes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProductType" NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "capacityLitres" DECIMAL(10,2),
    "requiresBottleExchange" BOOLEAN NOT NULL DEFAULT false,
    "isRewardEligible" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageObjectKey" TEXT,
    "lowStockThreshold" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addressId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "source" "OrderSource" NOT NULL DEFAULT 'CUSTOMER_WEB',
    "placedByUserId" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "deliveryFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "expectedEmptyBottles" INTEGER NOT NULL DEFAULT 0,
    "scheduledFor" TIMESTAMP(3),
    "instruction" "DeliveryInstruction" NOT NULL DEFAULT 'NONE',
    "instructionNotes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "isRewardItem" BOOLEAN NOT NULL DEFAULT false,
    "requiresBottleExchange" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "changedByUserId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "deliveryNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3),
    "assignedAt" TIMESTAMP(3),
    "dispatchedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" "DeliveryFailureReason",
    "failureNotes" TEXT,
    "remarks" TEXT,
    "bottlesDispatched" INTEGER NOT NULL DEFAULT 0,
    "bottlesDelivered" INTEGER NOT NULL DEFAULT 0,
    "emptyBottlesExpected" INTEGER NOT NULL DEFAULT 0,
    "emptyBottlesCollected" INTEGER NOT NULL DEFAULT 0,
    "damagedBottlesReturned" INTEGER NOT NULL DEFAULT 0,
    "shortageQuantity" INTEGER NOT NULL DEFAULT 0,
    "cashCollected" DECIMAL(14,2),
    "requiresReconciliation" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" TIMESTAMP(3),
    "reconciledByUserId" TEXT,
    "addressSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_status_history" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "fromStatus" "DeliveryStatus",
    "toStatus" "DeliveryStatus" NOT NULL,
    "changedByUserId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "movementType" "InventoryMovementType" NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fromState" "BottleState",
    "toState" "BottleState",
    "driverId" TEXT,
    "customerId" TEXT,
    "orderId" TEXT,
    "deliveryId" TEXT,
    "adjustmentId" TEXT,
    "performedByUserId" TEXT,
    "reason" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bottle_stock_positions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "state" "BottleState" NOT NULL,
    "holderType" "StockHolderType" NOT NULL DEFAULT 'WAREHOUSE',
    "holderId" TEXT NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bottle_stock_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "state" "BottleState" NOT NULL,
    "holderType" "StockHolderType" NOT NULL DEFAULT 'WAREHOUSE',
    "holderId" TEXT NOT NULL DEFAULT '',
    "previousQuantity" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "deltaQuantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "requestedByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "rejectionReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_bottle_balances" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bottlesHeld" INTEGER NOT NULL DEFAULT 0,
    "outstandingShortage" INTEGER NOT NULL DEFAULT 0,
    "lifetimeShortage" INTEGER NOT NULL DEFAULT 0,
    "lifetimeReturned" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_bottle_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_bottle_ledger" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "entryType" "BottleLedgerEntryType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "deliveryId" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,
    "reason" TEXT,
    "performedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_bottle_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensers" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "DispenserStatus" NOT NULL DEFAULT 'AVAILABLE',
    "ownership" "DispenserOwnership" NOT NULL DEFAULT 'COMPANY_OWNED',
    "maintenanceStatus" "MaintenanceStatus" NOT NULL DEFAULT 'OK',
    "customerId" TEXT,
    "addressId" TEXT,
    "purchaseCost" DECIMAL(14,2) NOT NULL,
    "salePrice" DECIMAL(14,2) NOT NULL,
    "installedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3),
    "imageObjectKey" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispensers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispenser_installations" (
    "id" TEXT NOT NULL,
    "dispenserId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addressId" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),
    "installedByUserId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "dispenser_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispenser_payment_plans" (
    "id" TEXT NOT NULL,
    "planNumber" TEXT NOT NULL,
    "dispenserId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "totalCost" DECIMAL(14,2) NOT NULL,
    "initialPayment" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "installmentAmount" DECIMAL(14,2) NOT NULL,
    "frequency" "InstallmentFrequency" NOT NULL DEFAULT 'MONTHLY',
    "totalInstallments" INTEGER NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "outstandingBalance" DECIMAL(14,2) NOT NULL,
    "status" "InstallmentPlanStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "nextPaymentDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "ownershipEligibleAt" TIMESTAMP(3),
    "ownershipTransferredAt" TIMESTAMP(3),
    "ownershipApprovedByUserId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispenser_payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispenser_installments" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountDue" DECIMAL(14,2) NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "overdueDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispenser_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL,
    "orderId" TEXT,
    "deliveryId" TEXT,
    "planId" TEXT,
    "installmentId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "method" "PaymentMethod" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerReference" TEXT,
    "idempotencyKey" TEXT,
    "collectedByUserId" TEXT,
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "evidenceObjectKey" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'SUCCESSFUL',
    "providerReference" TEXT,
    "performedByUserId" TEXT,
    "reason" TEXT,
    "providerPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referrerCustomerId" TEXT NOT NULL,
    "referredCustomerId" TEXT NOT NULL,
    "agentId" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "qualifyingOrderId" TEXT,
    "qualifiedAt" TIMESTAMP(3),
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_reward_balances" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "earned" INTEGER NOT NULL DEFAULT 0,
    "redeemed" INTEGER NOT NULL DEFAULT 0,
    "reversed" INTEGER NOT NULL DEFAULT 0,
    "adjusted" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_reward_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_ledger" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "RewardLedgerType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referralId" TEXT,
    "orderId" TEXT,
    "redemptionId" TEXT,
    "reason" TEXT,
    "performedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "actionUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_devices" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "dispenserId" TEXT,
    "simNumber" TEXT,
    "isSimulated" BOOLEAN NOT NULL DEFAULT true,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "batteryPercent" INTEGER,
    "waterLevelPercent" INTEGER,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "lastRefillAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracker_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_readings" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waterLevelPercent" INTEGER,
    "dailyUsageLitres" DECIMAL(10,2),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "batteryPercent" INTEGER,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tracker_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_alerts" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" "TrackerAlertType" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'WARNING',
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracker_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "previousValues" JSONB,
    "newValues" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "valueType" "SettingValueType" NOT NULL DEFAULT 'STRING',
    "category" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stored_files" (
    "id" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "entityType" TEXT,
    "entityId" TEXT,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stored_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_code_key" ON "users"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_userId_key" ON "customer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_customerCode_key" ON "customer_profiles"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_referralCode_key" ON "customer_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "customer_profiles_registeredByAgentId_idx" ON "customer_profiles"("registeredByAgentId");

-- CreateIndex
CREATE INDEX "customer_profiles_referredByCustomerId_idx" ON "customer_profiles"("referredByCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_userId_key" ON "driver_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profiles_driverCode_key" ON "driver_profiles"("driverCode");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_userId_key" ON "agent_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profiles_agentCode_key" ON "agent_profiles"("agentCode");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_userId_key" ON "staff_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_staffCode_key" ON "staff_profiles"("staffCode");

-- CreateIndex
CREATE INDEX "addresses_customerId_isActive_idx" ON "addresses"("customerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_type_isActive_idx" ON "products"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_customerId_status_idx" ON "orders"("customerId", "status");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_scheduledFor_idx" ON "orders"("scheduledFor");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE INDEX "order_status_history_orderId_createdAt_idx" ON "order_status_history"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_deliveryNumber_key" ON "deliveries"("deliveryNumber");

-- CreateIndex
CREATE INDEX "deliveries_driverId_status_idx" ON "deliveries"("driverId", "status");

-- CreateIndex
CREATE INDEX "deliveries_status_scheduledFor_idx" ON "deliveries"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "deliveries_requiresReconciliation_idx" ON "deliveries"("requiresReconciliation");

-- CreateIndex
CREATE INDEX "deliveries_completedAt_idx" ON "deliveries"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_orderId_attemptNumber_key" ON "deliveries"("orderId", "attemptNumber");

-- CreateIndex
CREATE INDEX "delivery_status_history_deliveryId_createdAt_idx" ON "delivery_status_history"("deliveryId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_movements_reference_key" ON "inventory_movements"("reference");

-- CreateIndex
CREATE INDEX "inventory_movements_productId_occurredAt_idx" ON "inventory_movements"("productId", "occurredAt");

-- CreateIndex
CREATE INDEX "inventory_movements_movementType_occurredAt_idx" ON "inventory_movements"("movementType", "occurredAt");

-- CreateIndex
CREATE INDEX "inventory_movements_driverId_idx" ON "inventory_movements"("driverId");

-- CreateIndex
CREATE INDEX "inventory_movements_customerId_idx" ON "inventory_movements"("customerId");

-- CreateIndex
CREATE INDEX "inventory_movements_deliveryId_idx" ON "inventory_movements"("deliveryId");

-- CreateIndex
CREATE INDEX "inventory_movements_occurredAt_idx" ON "inventory_movements"("occurredAt");

-- CreateIndex
CREATE INDEX "bottle_stock_positions_state_idx" ON "bottle_stock_positions"("state");

-- CreateIndex
CREATE INDEX "bottle_stock_positions_holderType_holderId_idx" ON "bottle_stock_positions"("holderType", "holderId");

-- CreateIndex
CREATE UNIQUE INDEX "bottle_stock_positions_productId_state_holderType_holderId_key" ON "bottle_stock_positions"("productId", "state", "holderType", "holderId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_adjustments_reference_key" ON "inventory_adjustments"("reference");

-- CreateIndex
CREATE INDEX "inventory_adjustments_status_requestedAt_idx" ON "inventory_adjustments"("status", "requestedAt");

-- CreateIndex
CREATE INDEX "inventory_adjustments_productId_idx" ON "inventory_adjustments"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_bottle_balances_customerId_key" ON "customer_bottle_balances"("customerId");

-- CreateIndex
CREATE INDEX "customer_bottle_balances_outstandingShortage_idx" ON "customer_bottle_balances"("outstandingShortage");

-- CreateIndex
CREATE INDEX "customer_bottle_ledger_customerId_createdAt_idx" ON "customer_bottle_ledger"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_bottle_ledger_entryType_idx" ON "customer_bottle_ledger"("entryType");

-- CreateIndex
CREATE UNIQUE INDEX "dispensers_assetTag_key" ON "dispensers"("assetTag");

-- CreateIndex
CREATE UNIQUE INDEX "dispensers_serialNumber_key" ON "dispensers"("serialNumber");

-- CreateIndex
CREATE INDEX "dispensers_status_idx" ON "dispensers"("status");

-- CreateIndex
CREATE INDEX "dispensers_ownership_idx" ON "dispensers"("ownership");

-- CreateIndex
CREATE INDEX "dispensers_customerId_idx" ON "dispensers"("customerId");

-- CreateIndex
CREATE INDEX "dispenser_installations_dispenserId_idx" ON "dispenser_installations"("dispenserId");

-- CreateIndex
CREATE INDEX "dispenser_installations_customerId_idx" ON "dispenser_installations"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "dispenser_payment_plans_planNumber_key" ON "dispenser_payment_plans"("planNumber");

-- CreateIndex
CREATE INDEX "dispenser_payment_plans_customerId_status_idx" ON "dispenser_payment_plans"("customerId", "status");

-- CreateIndex
CREATE INDEX "dispenser_payment_plans_status_nextPaymentDate_idx" ON "dispenser_payment_plans"("status", "nextPaymentDate");

-- CreateIndex
CREATE INDEX "dispenser_payment_plans_dispenserId_idx" ON "dispenser_payment_plans"("dispenserId");

-- CreateIndex
CREATE INDEX "dispenser_installments_status_dueDate_idx" ON "dispenser_installments"("status", "dueDate");

-- CreateIndex
CREATE INDEX "dispenser_installments_dueDate_idx" ON "dispenser_installments"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "dispenser_installments_planId_sequence_key" ON "dispenser_installments"("planId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotencyKey_key" ON "payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "payments_customerId_status_idx" ON "payments"("customerId", "status");

-- CreateIndex
CREATE INDEX "payments_status_createdAt_idx" ON "payments"("status", "createdAt");

-- CreateIndex
CREATE INDEX "payments_purpose_idx" ON "payments"("purpose");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_providerReference_key" ON "payments"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "payment_transactions_paymentId_createdAt_idx" ON "payment_transactions"("paymentId", "createdAt");

-- CreateIndex
CREATE INDEX "payment_transactions_type_idx" ON "payment_transactions"("type");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_referredCustomerId_key" ON "referrals"("referredCustomerId");

-- CreateIndex
CREATE INDEX "referrals_referrerCustomerId_status_idx" ON "referrals"("referrerCustomerId", "status");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_agentId_idx" ON "referrals"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_reward_balances_customerId_key" ON "customer_reward_balances"("customerId");

-- CreateIndex
CREATE INDEX "reward_ledger_customerId_createdAt_idx" ON "reward_ledger"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "reward_ledger_type_idx" ON "reward_ledger"("type");

-- CreateIndex
CREATE UNIQUE INDEX "reward_redemptions_orderId_key" ON "reward_redemptions"("orderId");

-- CreateIndex
CREATE INDEX "reward_redemptions_customerId_idx" ON "reward_redemptions"("customerId");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_category_idx" ON "notifications"("category");

-- CreateIndex
CREATE UNIQUE INDEX "tracker_devices_deviceCode_key" ON "tracker_devices"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "tracker_devices_dispenserId_key" ON "tracker_devices"("dispenserId");

-- CreateIndex
CREATE INDEX "tracker_devices_isOnline_idx" ON "tracker_devices"("isOnline");

-- CreateIndex
CREATE INDEX "tracker_readings_deviceId_recordedAt_idx" ON "tracker_readings"("deviceId", "recordedAt");

-- CreateIndex
CREATE INDEX "tracker_alerts_deviceId_isResolved_idx" ON "tracker_alerts"("deviceId", "isResolved");

-- CreateIndex
CREATE INDEX "tracker_alerts_isResolved_createdAt_idx" ON "tracker_alerts"("isResolved", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE UNIQUE INDEX "stored_files_objectKey_key" ON "stored_files"("objectKey");

-- CreateIndex
CREATE INDEX "stored_files_entityType_entityId_idx" ON "stored_files"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_registeredByAgentId_fkey" FOREIGN KEY ("registeredByAgentId") REFERENCES "agent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_referredByCustomerId_fkey" FOREIGN KEY ("referredByCustomerId") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profiles" ADD CONSTRAINT "agent_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_placedByUserId_fkey" FOREIGN KEY ("placedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_reconciledByUserId_fkey" FOREIGN KEY ("reconciledByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_status_history" ADD CONSTRAINT "delivery_status_history_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_status_history" ADD CONSTRAINT "delivery_status_history_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "inventory_adjustments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bottle_stock_positions" ADD CONSTRAINT "bottle_stock_positions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bottle_balances" ADD CONSTRAINT "customer_bottle_balances_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bottle_ledger" ADD CONSTRAINT "customer_bottle_ledger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bottle_ledger" ADD CONSTRAINT "customer_bottle_ledger_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bottle_ledger" ADD CONSTRAINT "customer_bottle_ledger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bottle_ledger" ADD CONSTRAINT "customer_bottle_ledger_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_bottle_ledger" ADD CONSTRAINT "customer_bottle_ledger_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensers" ADD CONSTRAINT "dispensers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensers" ADD CONSTRAINT "dispensers_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_installations" ADD CONSTRAINT "dispenser_installations_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "dispensers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_installations" ADD CONSTRAINT "dispenser_installations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_installations" ADD CONSTRAINT "dispenser_installations_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_installations" ADD CONSTRAINT "dispenser_installations_installedByUserId_fkey" FOREIGN KEY ("installedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_payment_plans" ADD CONSTRAINT "dispenser_payment_plans_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "dispensers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_payment_plans" ADD CONSTRAINT "dispenser_payment_plans_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_payment_plans" ADD CONSTRAINT "dispenser_payment_plans_ownershipApprovedByUserId_fkey" FOREIGN KEY ("ownershipApprovedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispenser_installments" ADD CONSTRAINT "dispenser_installments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "dispenser_payment_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_planId_fkey" FOREIGN KEY ("planId") REFERENCES "dispenser_payment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "dispenser_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_collectedByUserId_fkey" FOREIGN KEY ("collectedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerCustomerId_fkey" FOREIGN KEY ("referrerCustomerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredCustomerId_fkey" FOREIGN KEY ("referredCustomerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_qualifyingOrderId_fkey" FOREIGN KEY ("qualifyingOrderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reward_balances" ADD CONSTRAINT "customer_reward_balances_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "reward_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_ledger" ADD CONSTRAINT "reward_ledger_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_devices" ADD CONSTRAINT "tracker_devices_dispenserId_fkey" FOREIGN KEY ("dispenserId") REFERENCES "dispensers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_readings" ADD CONSTRAINT "tracker_readings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "tracker_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_alerts" ADD CONSTRAINT "tracker_alerts_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "tracker_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_alerts" ADD CONSTRAINT "tracker_alerts_acknowledgedByUserId_fkey" FOREIGN KEY ("acknowledgedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_files" ADD CONSTRAINT "stored_files_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
