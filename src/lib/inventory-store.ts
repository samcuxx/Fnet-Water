import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";

export type BottleItemType =
  | "FILLED_BOTTLES"
  | "EMPTY_BOTTLES"
  | "DAMAGED_BOTTLES"
  | "LOST_BOTTLES";

export type InventoryItemType = BottleItemType | "DISPENSERS";

export type StockAction = "ADD" | "DEDUCT";

export type DispenserStatusType =
  | "AVAILABLE"
  | "INSTALLED_ON_PLAN"
  | "INSTALLED_OWNED"
  | "FAULTY"
  | "MAINTENANCE";

export interface BottleInventoryData {
  id: string;
  filledWarehouse: number;
  emptyWarehouse: number;
  withCustomers: number;
  damaged: number;
  lost: number;
  totalFleet: number;
  circulationRatePercent: number;
  lastUpdated: string;
}

export interface DispenserItem {
  id: string;
  serialNumber: string;
  modelName: string;
  status: DispenserStatusType;
  customerName?: string;
  customerPhone?: string;
  location?: string;
  waterLevelPercent: number;
  batteryPercent: number;
  isOnline: boolean;
  installedDate?: string;
  notes?: string;
  updatedAt: string;
}

export interface InventoryAuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: string;
  itemType: InventoryItemType;
  delta: number;
  previousBalance: number;
  newBalance: number;
  reason: string;
}

export interface LowStockAlert {
  id: string;
  item: string;
  currentStock: number;
  threshold: number;
  severity: "WARNING" | "CRITICAL";
  message: string;
}

export const LOW_STOCK_THRESHOLD_FILLED = 150;
export const LOW_STOCK_THRESHOLD_EMPTY = 100;
export const LOW_STOCK_THRESHOLD_DISPENSERS = 5;

// In-Memory State
let memoryBottleInventory: BottleInventoryData = {
  id: "inv_bottles_001",
  filledWarehouse: 520,
  emptyWarehouse: 280,
  withCustomers: 1200,
  damaged: 18,
  lost: 6,
  totalFleet: 2024,
  circulationRatePercent: 89.0,
  lastUpdated: new Date().toISOString(),
};

const initialDispensers: DispenserItem[] = [
  {
    id: "dsp_001",
    serialNumber: "DSP-GH-0101",
    modelName: "Aquamaster Pro Hot/Cold",
    status: "INSTALLED_ON_PLAN",
    customerName: "Zenith Bank Head Office",
    customerPhone: "0244112233",
    location: "Ridge, Accra",
    waterLevelPercent: 78,
    batteryPercent: 96,
    isOnline: true,
    installedDate: "2026-01-15",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_002",
    serialNumber: "DSP-GH-0102",
    modelName: "HydroPure Floor Standing",
    status: "INSTALLED_ON_PLAN",
    customerName: "Dr. Mensah Clinic",
    customerPhone: "0208112233",
    location: "Osu, Accra",
    waterLevelPercent: 42,
    batteryPercent: 92,
    isOnline: true,
    installedDate: "2026-02-01",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_003",
    serialNumber: "DSP-GH-0103",
    modelName: "Aquamaster Pro Hot/Cold",
    status: "INSTALLED_OWNED",
    customerName: "Kwesi Appiah",
    customerPhone: "0241234567",
    location: "East Legon, Accra",
    waterLevelPercent: 90,
    batteryPercent: 98,
    isOnline: true,
    installedDate: "2025-11-20",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_004",
    serialNumber: "DSP-GH-0104",
    modelName: "EcoStream Tabletop",
    status: "AVAILABLE",
    location: "Warehouse Central, Spintex",
    waterLevelPercent: 100,
    batteryPercent: 100,
    isOnline: true,
    notes: "Tested and sanitized, ready for installation",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_005",
    serialNumber: "DSP-GH-0105",
    modelName: "Aquamaster Pro Hot/Cold",
    status: "AVAILABLE",
    location: "Warehouse Central, Spintex",
    waterLevelPercent: 100,
    batteryPercent: 100,
    isOnline: true,
    notes: "New stock from factory packaging",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_006",
    serialNumber: "DSP-GH-0106",
    modelName: "HydroPure Floor Standing",
    status: "AVAILABLE",
    location: "Warehouse Central, Spintex",
    waterLevelPercent: 100,
    batteryPercent: 100,
    isOnline: true,
    notes: "Inspection passed",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_007",
    serialNumber: "DSP-GH-0107",
    modelName: "EcoStream Tabletop",
    status: "FAULTY",
    location: "Repair Workshop, Spintex",
    waterLevelPercent: 0,
    batteryPercent: 45,
    isOnline: false,
    notes: "Cooling sensor malfunction reported by customer",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dsp_008",
    serialNumber: "DSP-GH-0108",
    modelName: "Aquamaster Pro Hot/Cold",
    status: "MAINTENANCE",
    location: "Repair Workshop, Spintex",
    waterLevelPercent: 0,
    batteryPercent: 80,
    isOnline: false,
    notes: "Scheduled pump descaling and sanitation",
    updatedAt: new Date().toISOString(),
  },
];

const memoryDispensers = new Map<string, DispenserItem>(
  initialDispensers.map((d) => [d.id, d])
);

const memoryAuditLogs: InventoryAuditLog[] = [
  {
    id: "log_001",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    userName: "Samuel Danquah",
    userEmail: "manager@fnetwater.com",
    action: "STOCK_IN",
    itemType: "FILLED_BOTTLES",
    delta: 150,
    previousBalance: 370,
    newBalance: 520,
    reason: "Factory bottling run #42 completed and QC approved",
  },
  {
    id: "log_002",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    userName: "Kwame Asante",
    userEmail: "driver@fnetwater.com",
    action: "DAMAGE_LOGGED",
    itemType: "DAMAGED_BOTTLES",
    delta: 2,
    previousBalance: 16,
    newBalance: 18,
    reason: "Hairline crack on neck discovered during customer return in East Legon",
  },
  {
    id: "log_003",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    userName: "Samuel Danquah",
    userEmail: "manager@fnetwater.com",
    action: "DISPENSER_STATUS_CHANGE",
    itemType: "DISPENSERS",
    delta: 0,
    previousBalance: 3,
    newBalance: 3,
    reason: "DSP-GH-0107 moved from customer to repair workshop for sensor inspection",
  },
];

function calculateCirculation(data: {
  filledWarehouse: number;
  emptyWarehouse: number;
  withCustomers: number;
  damaged: number;
  lost: number;
}) {
  const total =
    data.filledWarehouse +
    data.emptyWarehouse +
    data.withCustomers +
    data.damaged +
    data.lost;
  const activeWorking = data.filledWarehouse + data.emptyWarehouse + data.withCustomers;
  const rate = total > 0 ? Number(((activeWorking / total) * 100).toFixed(1)) : 100;
  return { total, rate };
}

/**
 * Retrieve current bottle inventory balances
 */
export async function getBottleInventory(): Promise<BottleInventoryData> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbInv = await prisma.bottleInventory.findFirst({
        orderBy: { lastUpdated: "desc" },
      });
      if (dbInv) {
        const { total, rate } = calculateCirculation({
          filledWarehouse: dbInv.filledWarehouse,
          emptyWarehouse: dbInv.emptyWarehouse,
          withCustomers: dbInv.withCustomers,
          damaged: dbInv.damaged,
          lost: dbInv.lost,
        });
        return {
          id: dbInv.id,
          filledWarehouse: dbInv.filledWarehouse,
          emptyWarehouse: dbInv.emptyWarehouse,
          withCustomers: dbInv.withCustomers,
          damaged: dbInv.damaged,
          lost: dbInv.lost,
          totalFleet: total,
          circulationRatePercent: rate,
          lastUpdated: dbInv.lastUpdated.toISOString(),
        };
      }
    } catch {
      // Fallback
    }
  }

  const { total, rate } = calculateCirculation(memoryBottleInventory);
  memoryBottleInventory.totalFleet = total;
  memoryBottleInventory.circulationRatePercent = rate;
  return { ...memoryBottleInventory };
}

/**
 * Retrieve list of dispensers, optionally filtered by status
 */
export async function getDispensers(statusFilter?: string): Promise<DispenserItem[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbDispensers = await prisma.dispenser.findMany({
        where: statusFilter ? { status: statusFilter as any } : undefined,
        include: {
          customerProfile: {
            include: { user: true },
          },
        },
        orderBy: { serialNumber: "asc" },
      });

      if (dbDispensers && dbDispensers.length > 0) {
        return dbDispensers.map((d) => ({
          id: d.id,
          serialNumber: d.serialNumber,
          modelName: d.modelName,
          status: d.status as DispenserStatusType,
          customerName: d.customerProfile?.user?.name,
          customerPhone: d.customerProfile?.user?.phone,
          location: d.maintenanceNotes || "Accra Operational Fleet",
          waterLevelPercent: d.waterLevelPercent,
          batteryPercent: d.batteryPercent,
          isOnline: d.isOnline,
          notes: d.maintenanceNotes || undefined,
          updatedAt: d.updatedAt.toISOString(),
        }));
      }
    } catch {
      // Fallback
    }
  }

  const all = Array.from(memoryDispensers.values());
  if (!statusFilter || statusFilter === "ALL") {
    return all;
  }
  return all.filter((d) => d.status === statusFilter);
}

/**
 * Retrieve single dispenser by ID
 */
export async function getDispenserById(id: string): Promise<DispenserItem | null> {
  const dispensers = await getDispensers();
  return dispensers.find((d) => d.id === id || d.serialNumber === id) || null;
}

/**
 * Retrieve low stock alerts
 */
export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  const alerts: LowStockAlert[] = [];
  const bottles = await getBottleInventory();

  if (bottles.filledWarehouse < LOW_STOCK_THRESHOLD_FILLED) {
    alerts.push({
      id: "alert_low_filled_bottles",
      item: "Filled Bottles (Warehouse)",
      currentStock: bottles.filledWarehouse,
      threshold: LOW_STOCK_THRESHOLD_FILLED,
      severity: bottles.filledWarehouse < 75 ? "CRITICAL" : "WARNING",
      message: `Low filled bottle stock: Only ${bottles.filledWarehouse} bottles ready in warehouse (Threshold: ${LOW_STOCK_THRESHOLD_FILLED}). Initiate bottling cycle.`,
    });
  }

  const dispensers = await getDispensers();
  const availableDispensers = dispensers.filter((d) => d.status === "AVAILABLE").length;
  if (availableDispensers < LOW_STOCK_THRESHOLD_DISPENSERS) {
    alerts.push({
      id: "alert_low_dispensers",
      item: "Smart Dispensers (Available)",
      currentStock: availableDispensers,
      threshold: LOW_STOCK_THRESHOLD_DISPENSERS,
      severity: availableDispensers <= 1 ? "CRITICAL" : "WARNING",
      message: `Low available dispensers: Only ${availableDispensers} units in warehouse for new customer deployments (Threshold: ${LOW_STOCK_THRESHOLD_DISPENSERS}).`,
    });
  }

  return alerts;
}

/**
 * Adjust stock quantity manually (with mandatory audit log)
 */
export async function adjustStock(params: {
  itemType: InventoryItemType;
  action: StockAction;
  quantity: number;
  reason: string;
  user: { name: string; email: string };
}): Promise<{
  success: boolean;
  itemType: InventoryItemType;
  delta: number;
  previousBalance: number;
  newBalance: number;
  auditLogId: string;
}> {
  if (params.quantity <= 0) {
    throw new Error("Quantity must be a positive integer greater than zero.");
  }
  if (!params.reason || params.reason.trim().length < 5) {
    throw new Error("A clear reason (at least 5 characters) is required for audit logging.");
  }

  const delta = params.action === "ADD" ? params.quantity : -params.quantity;
  let previousBalance = 0;
  let newBalance = 0;

  if (params.itemType === "FILLED_BOTTLES") {
    previousBalance = memoryBottleInventory.filledWarehouse;
    newBalance = Math.max(0, previousBalance + delta);
    memoryBottleInventory.filledWarehouse = newBalance;
  } else if (params.itemType === "EMPTY_BOTTLES") {
    previousBalance = memoryBottleInventory.emptyWarehouse;
    newBalance = Math.max(0, previousBalance + delta);
    memoryBottleInventory.emptyWarehouse = newBalance;
  } else if (params.itemType === "DAMAGED_BOTTLES") {
    previousBalance = memoryBottleInventory.damaged;
    newBalance = Math.max(0, previousBalance + delta);
    memoryBottleInventory.damaged = newBalance;
  } else if (params.itemType === "LOST_BOTTLES") {
    previousBalance = memoryBottleInventory.lost;
    newBalance = Math.max(0, previousBalance + delta);
    memoryBottleInventory.lost = newBalance;
  } else if (params.itemType === "DISPENSERS") {
    const available = Array.from(memoryDispensers.values()).filter(
      (d) => d.status === "AVAILABLE"
    );
    previousBalance = available.length;
    if (params.action === "ADD") {
      for (let i = 0; i < params.quantity; i++) {
        const nextId = `dsp_${Date.now()}_${i}`;
        const serialNum = `DSP-GH-${String(memoryDispensers.size + 101).padStart(4, "0")}`;
        memoryDispensers.set(nextId, {
          id: nextId,
          serialNumber: serialNum,
          modelName: "Aquamaster Pro Hot/Cold",
          status: "AVAILABLE",
          location: "Warehouse Central, Spintex",
          waterLevelPercent: 100,
          batteryPercent: 100,
          isOnline: true,
          notes: params.reason,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    const updatedAvailable = Array.from(memoryDispensers.values()).filter(
      (d) => d.status === "AVAILABLE"
    );
    newBalance = updatedAvailable.length;
  }

  // Recalculate totals
  const { total, rate } = calculateCirculation(memoryBottleInventory);
  memoryBottleInventory.totalFleet = total;
  memoryBottleInventory.circulationRatePercent = rate;
  memoryBottleInventory.lastUpdated = new Date().toISOString();

  // Create Audit Log
  const log: InventoryAuditLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userName: params.user.name || "Manager",
    userEmail: params.user.email || "manager@fnetwater.com",
    action: params.action === "ADD" ? "STOCK_IN" : "STOCK_DEDUCT",
    itemType: params.itemType,
    delta,
    previousBalance,
    newBalance,
    reason: params.reason,
  };
  memoryAuditLogs.unshift(log);

  // Sync with Prisma DB if online
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.auditLog.create({
        data: {
          action: log.action,
          entityType: params.itemType,
          entityId: log.id,
          details: `${log.userName} (${log.userEmail}) adjusted ${params.itemType} by ${delta > 0 ? "+" : ""}${delta}. Previous: ${previousBalance}, New: ${newBalance}. Reason: ${params.reason}`,
        },
      });

      const dbInv = await prisma.bottleInventory.findFirst();
      if (dbInv) {
        await prisma.bottleInventory.update({
          where: { id: dbInv.id },
          data: {
            filledWarehouse: memoryBottleInventory.filledWarehouse,
            emptyWarehouse: memoryBottleInventory.emptyWarehouse,
            damaged: memoryBottleInventory.damaged,
            lost: memoryBottleInventory.lost,
          },
        });
      }
    } catch {
      // Non-fatal fallback
    }
  }

  return {
    success: true,
    itemType: params.itemType,
    delta,
    previousBalance,
    newBalance,
    auditLogId: log.id,
  };
}

/**
 * Update a dispenser status (e.g., mark as in repair, available, etc.)
 */
export async function updateDispenserStatus(params: {
  id: string;
  status: DispenserStatusType;
  notes?: string;
  user: { name: string; email: string };
}): Promise<DispenserItem> {
  const dispenser = memoryDispensers.get(params.id);
  if (!dispenser) {
    throw new Error(`Dispenser not found with ID ${params.id}`);
  }

  const oldStatus = dispenser.status;
  dispenser.status = params.status;
  if (params.notes) {
    dispenser.notes = params.notes;
  }
  dispenser.updatedAt = new Date().toISOString();
  memoryDispensers.set(params.id, dispenser);

  // Log status change
  const log: InventoryAuditLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userName: params.user.name,
    userEmail: params.user.email,
    action: "DISPENSER_STATUS_CHANGE",
    itemType: "DISPENSERS",
    delta: 0,
    previousBalance: 0,
    newBalance: 0,
    reason: `Dispenser ${dispenser.serialNumber} status changed from ${oldStatus} to ${params.status}. Notes: ${params.notes || "None"}`,
  };
  memoryAuditLogs.unshift(log);

  // DB Sync
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.dispenser.update({
        where: { id: params.id },
        data: {
          status: params.status as any,
          maintenanceNotes: params.notes,
        },
      });
      await prisma.auditLog.create({
        data: {
          action: "DISPENSER_STATUS_CHANGE",
          entityType: "DISPENSER",
          entityId: params.id,
          details: log.reason,
        },
      });
    } catch {
      // Non-fatal
    }
  }

  return dispenser;
}

/**
 * Sync inventory when a driver completes a delivery with bottles
 */
export async function syncDeliveryExchangeToInventory(data: {
  filledDelivered: number;
  emptyCollected: number;
  damagedCount: number;
  orderNumber?: string;
}) {
  // 1. Warehouse filled bottles decrease by filled delivered
  memoryBottleInventory.filledWarehouse = Math.max(
    0,
    memoryBottleInventory.filledWarehouse - data.filledDelivered
  );

  // 2. Warehouse empty bottles increase by empty collected
  memoryBottleInventory.emptyWarehouse += data.emptyCollected;

  // 3. Customers held balance changes by net difference
  memoryBottleInventory.withCustomers = Math.max(
    0,
    memoryBottleInventory.withCustomers + (data.filledDelivered - data.emptyCollected)
  );

  // 4. Damaged bottles increase
  if (data.damagedCount > 0) {
    memoryBottleInventory.damaged += data.damagedCount;
  }

  const { total, rate } = calculateCirculation(memoryBottleInventory);
  memoryBottleInventory.totalFleet = total;
  memoryBottleInventory.circulationRatePercent = rate;
  memoryBottleInventory.lastUpdated = new Date().toISOString();

  // Create audit record
  const log: InventoryAuditLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userName: "Delivery Fleet Automation",
    userEmail: "dispatch@fnetwater.com",
    action: "DELIVERY_EXCHANGE",
    itemType: "FILLED_BOTTLES",
    delta: -data.filledDelivered,
    previousBalance: memoryBottleInventory.filledWarehouse + data.filledDelivered,
    newBalance: memoryBottleInventory.filledWarehouse,
    reason: `Delivery completed for ${data.orderNumber || "Order"}. Delivered: ${data.filledDelivered}, Empties Collected: ${data.emptyCollected}, Damaged: ${data.damagedCount}.`,
  };
  memoryAuditLogs.unshift(log);

  return { ...memoryBottleInventory };
}

/**
 * Retrieve audit logs (newest first)
 */
export async function getAuditLogs(limit: number = 50): Promise<InventoryAuditLog[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbLogs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
      if (dbLogs && dbLogs.length > 0) {
        return dbLogs.map((l) => ({
          id: l.id,
          timestamp: l.createdAt.toISOString(),
          userName: l.user?.name || "System Staff",
          userEmail: l.user?.email || "staff@fnetwater.com",
          action: l.action,
          itemType: (l.entityType as InventoryItemType) || "FILLED_BOTTLES",
          delta: 0,
          previousBalance: 0,
          newBalance: 0,
          reason: l.details || "No details recorded",
        }));
      }
    } catch {
      // Fallback
    }
  }

  return memoryAuditLogs.slice(0, limit);
}
