import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";

export type AddressCategory = "HOME" | "OFFICE" | "SHOP" | "SCHOOL" | "WAREHOUSE" | "OTHER";

export interface StoredAddress {
  id: string;
  userId: string;
  category: AddressCategory;
  areaName: string;
  digitalAddress: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface StoredCustomerProfile {
  id: string;
  userId: string;
  customerCode: string;
  ghanaCardNumber?: string;
  bottlesHeld: number;
  freeBottleBalance: number;
  referralCode: string;
  totalReferrals: number;
  dispenserPlan: string;
  dispenserPaidMonths: number;
  dispenserTotalMonths: number;
}

// Default seed addresses for demo customer (Ama Osei: usr_customer_001)
const DEFAULT_SEED_ADDRESSES: StoredAddress[] = [
  {
    id: "addr_001",
    userId: "usr_customer_001",
    category: "HOME",
    areaName: "House 14, Boundary Road, East Legon",
    digitalAddress: "GA-492-1029",
    gpsLatitude: 5.6508,
    gpsLongitude: -0.1554,
    deliveryInstructions: "Ring gate bell or call 0241000005 on arrival",
    isDefault: true,
    createdAt: "2026-02-20T12:00:00.000Z",
  },
  {
    id: "addr_002",
    userId: "usr_customer_001",
    category: "OFFICE",
    areaName: "Floor 3, Silicon Accra Hub, Dzorwulu",
    digitalAddress: "GA-183-9021",
    gpsLatitude: 5.6125,
    gpsLongitude: -0.1983,
    deliveryInstructions: "Leave 19L refills with ground floor security reception",
    isDefault: false,
    createdAt: "2026-02-22T14:30:00.000Z",
  },
  {
    id: "addr_003",
    userId: "usr_customer_001",
    category: "SHOP",
    areaName: "Shop 4B, Accra Mall Commercial Wing, Tetteh Quarshie",
    digitalAddress: "GA-019-3382",
    gpsLatitude: 5.6231,
    gpsLongitude: -0.1772,
    deliveryInstructions: "Deliver to back service bay between 9am and 11am",
    isDefault: false,
    createdAt: "2026-03-01T09:15:00.000Z",
  },
];

const DEFAULT_SEED_CUSTOMER_PROFILES: Record<string, StoredCustomerProfile> = {
  usr_customer_001: {
    id: "cp_001",
    userId: "usr_customer_001",
    customerCode: "CUST-8802",
    ghanaCardNumber: "GHA-719204910-3",
    bottlesHeld: 4,
    freeBottleBalance: 1,
    referralCode: "FNW-AMA01",
    totalReferrals: 5,
    dispenserPlan: "Aquamaster Dual-Tap (Rent-to-Own)",
    dispenserPaidMonths: 8,
    dispenserTotalMonths: 12,
  },
};

const globalForCustomer = globalThis as unknown as {
  memoryAddresses?: Map<string, StoredAddress>;
  memoryCustomerProfiles?: Map<string, StoredCustomerProfile>;
};

const memoryAddresses: Map<string, StoredAddress> = (() => {
  if (globalForCustomer.memoryAddresses) {
    for (const addr of DEFAULT_SEED_ADDRESSES) {
      if (!globalForCustomer.memoryAddresses.has(addr.id)) {
        globalForCustomer.memoryAddresses.set(addr.id, { ...addr });
      }
    }
    return globalForCustomer.memoryAddresses;
  }
  const map = new Map<string, StoredAddress>(DEFAULT_SEED_ADDRESSES.map((a) => [a.id, { ...a }]));
  if (process.env.NODE_ENV !== "production") {
    globalForCustomer.memoryAddresses = map;
  }
  return map;
})();

const memoryCustomerProfiles: Map<string, StoredCustomerProfile> = (() => {
  if (globalForCustomer.memoryCustomerProfiles) {
    for (const [uid, cp] of Object.entries(DEFAULT_SEED_CUSTOMER_PROFILES)) {
      if (!globalForCustomer.memoryCustomerProfiles.has(uid)) {
        globalForCustomer.memoryCustomerProfiles.set(uid, { ...cp });
      }
    }
    return globalForCustomer.memoryCustomerProfiles;
  }
  const map = new Map<string, StoredCustomerProfile>(
    Object.entries(DEFAULT_SEED_CUSTOMER_PROFILES).map(([uid, cp]) => [uid, { ...cp }])
  );
  if (process.env.NODE_ENV !== "production") {
    globalForCustomer.memoryCustomerProfiles = map;
  }
  return map;
})();

/**
 * Validate Ghana Digital Address format (e.g. GA-183-9021, AK-039-1102) or GPS Coordinates
 */
export function isValidGhanaDigitalAddress(code: string): boolean {
  if (!code) return false;
  const cleaned = code.trim().toUpperCase();
  // Standard format: 2 letters, 3-4 digits, 4 digits (e.g. GA-492-1029 or GA4921029)
  const regex = /^[A-Z]{2}-?\d{3,4}-?\d{4}$/;
  // GPS coordinates format (e.g. "GPS: 5.6508, -0.1554", "5.6508, -0.1554", "GA-GPS-1029")
  const gpsRegex = /^(GPS:?\s*)?-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/i;
  const gpsTagRegex = /^[A-Z]{2,4}-(GPS|\d{3,4})-\d{4}$/i;
  return regex.test(cleaned) || gpsRegex.test(cleaned) || gpsTagRegex.test(cleaned);
}

/**
 * Formats a Ghana Digital Address (e.g. ga1839021 -> GA-183-9021)
 */
export function formatGhanaDigitalAddress(code: string): string {
  const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length >= 9) {
    const region = cleaned.slice(0, 2);
    const district = cleaned.slice(2, cleaned.length - 4);
    const loc = cleaned.slice(-4);
    return `${region}-${district}-${loc}`;
  }
  return code.trim().toUpperCase();
}

/**
 * Gets a customer's detailed profile
 */
export async function getCustomerProfile(userId: string): Promise<StoredCustomerProfile> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbProfile = await prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (dbProfile) {
        return {
          id: dbProfile.id,
          userId: dbProfile.userId,
          customerCode: dbProfile.customerCode,
          ghanaCardNumber: dbProfile.ghanaCardNumber || undefined,
          bottlesHeld: dbProfile.bottlesHeld,
          freeBottleBalance: dbProfile.freeBottleBalance,
          referralCode: dbProfile.referralCode,
          totalReferrals: 0,
          dispenserPlan: "Aquamaster Dual-Tap (Rent-to-Own)",
          dispenserPaidMonths: 8,
          dispenserTotalMonths: 12,
        };
      }
    } catch {
      // Fallback to memory
    }
  }

  // Memory fallback
  let profile = memoryCustomerProfiles.get(userId);
  if (!profile) {
    profile = {
      id: `cp_${Date.now()}`,
      userId,
      customerCode: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      bottlesHeld: 2,
      freeBottleBalance: 0,
      referralCode: `FNW-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      totalReferrals: 0,
      dispenserPlan: "None (Refill Only)",
      dispenserPaidMonths: 0,
      dispenserTotalMonths: 12,
    };
    memoryCustomerProfiles.set(userId, profile);
  }

  return profile;
}

/**
 * Updates customer profile specifics (Ghana Card, etc.)
 */
export async function updateCustomerProfileData(
  userId: string,
  data: {
    ghanaCardNumber?: string;
    bottlesHeld?: number;
    freeBottleBalance?: number;
  }
): Promise<StoredCustomerProfile> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.customerProfile.update({
        where: { userId },
        data: {
          ghanaCardNumber: data.ghanaCardNumber,
          bottlesHeld: data.bottlesHeld,
          freeBottleBalance: data.freeBottleBalance,
        },
      });
    } catch {
      // Memory fallback
    }
  }

  const profile = await getCustomerProfile(userId);
  if (data.ghanaCardNumber !== undefined) profile.ghanaCardNumber = data.ghanaCardNumber;
  if (data.bottlesHeld !== undefined) profile.bottlesHeld = data.bottlesHeld;
  if (data.freeBottleBalance !== undefined) profile.freeBottleBalance = data.freeBottleBalance;
  memoryCustomerProfiles.set(userId, profile);
  return profile;
}

/**
 * Gets all saved delivery addresses for a user
 */
export async function getCustomerAddresses(userId: string): Promise<StoredAddress[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbProfile = await prisma.customerProfile.findUnique({
        where: { userId },
      });

      if (dbProfile) {
        const addresses = await prisma.deliveryAddress.findMany({
          where: { customerProfileId: dbProfile.id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });

        if (addresses.length > 0) {
          return addresses.map((a) => ({
            id: a.id,
            userId,
            category: a.category as AddressCategory,
            areaName: a.areaName,
            digitalAddress: a.digitalAddress,
            gpsLatitude: a.gpsLatitude ?? undefined,
            gpsLongitude: a.gpsLongitude ?? undefined,
            deliveryInstructions: a.deliveryInstructions ?? undefined,
            isDefault: a.isDefault,
            createdAt: a.createdAt.toISOString(),
          }));
        }
      }
    } catch {
      // Fallback
    }
  }

  const list = Array.from(memoryAddresses.values()).filter((a) => a.userId === userId);
  // Sort so default is first
  return list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
}

/**
 * Adds a new delivery address
 */
export async function createCustomerAddress(
  userId: string,
  data: {
    category: AddressCategory;
    areaName: string;
    digitalAddress: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
    gpsLatitude?: number;
    gpsLongitude?: number;
  }
): Promise<StoredAddress> {
  const formattedDigital = formatGhanaDigitalAddress(data.digitalAddress);
  const id = `addr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // If this address is set as default, mark existing addresses as non-default
  if (data.isDefault) {
    for (const a of memoryAddresses.values()) {
      if (a.userId === userId) {
        a.isDefault = false;
        memoryAddresses.set(a.id, a);
      }
    }
  }

  // If user has no existing addresses, make this one default automatically
  const existing = await getCustomerAddresses(userId);
  const isDefault = data.isDefault || existing.length === 0;

  const newAddress: StoredAddress = {
    id,
    userId,
    category: data.category,
    areaName: data.areaName.trim(),
    digitalAddress: formattedDigital,
    gpsLatitude: data.gpsLatitude,
    gpsLongitude: data.gpsLongitude,
    deliveryInstructions: data.deliveryInstructions?.trim(),
    isDefault,
    createdAt: new Date().toISOString(),
  };

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbProfile = await prisma.customerProfile.findUnique({ where: { userId } });
      if (dbProfile) {
        if (isDefault) {
          await prisma.deliveryAddress.updateMany({
            where: { customerProfileId: dbProfile.id },
            data: { isDefault: false },
          });
        }

        const created = await prisma.deliveryAddress.create({
          data: {
            customerProfileId: dbProfile.id,
            category: data.category,
            areaName: data.areaName.trim(),
            digitalAddress: formattedDigital,
            gpsLatitude: data.gpsLatitude,
            gpsLongitude: data.gpsLongitude,
            deliveryInstructions: data.deliveryInstructions?.trim(),
            isDefault,
          },
        });
        newAddress.id = created.id;
      }
    } catch {
      // Memory fallback active
    }
  }

  memoryAddresses.set(newAddress.id, newAddress);
  return newAddress;
}

/**
 * Updates an existing delivery address
 */
export async function updateCustomerAddress(
  addressId: string,
  userId: string,
  data: {
    category?: AddressCategory;
    areaName?: string;
    digitalAddress?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
    gpsLatitude?: number;
    gpsLongitude?: number;
  }
): Promise<StoredAddress | null> {
  if (data.isDefault) {
    for (const a of memoryAddresses.values()) {
      if (a.userId === userId) {
        a.isDefault = false;
        memoryAddresses.set(a.id, a);
      }
    }
  }

  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      if (data.isDefault) {
        const dbProfile = await prisma.customerProfile.findUnique({ where: { userId } });
        if (dbProfile) {
          await prisma.deliveryAddress.updateMany({
            where: { customerProfileId: dbProfile.id },
            data: { isDefault: false },
          });
        }
      }

      await prisma.deliveryAddress.update({
        where: { id: addressId },
        data: {
          category: data.category,
          areaName: data.areaName?.trim(),
          digitalAddress: data.digitalAddress
            ? formatGhanaDigitalAddress(data.digitalAddress)
            : undefined,
          deliveryInstructions: data.deliveryInstructions?.trim(),
          isDefault: data.isDefault,
          gpsLatitude: data.gpsLatitude,
          gpsLongitude: data.gpsLongitude,
        },
      });
    } catch {
      // Fallback
    }
  }

  const addr = memoryAddresses.get(addressId);
  if (addr && addr.userId === userId) {
    if (data.category) addr.category = data.category;
    if (data.areaName) addr.areaName = data.areaName.trim();
    if (data.digitalAddress) addr.digitalAddress = formatGhanaDigitalAddress(data.digitalAddress);
    if (data.deliveryInstructions !== undefined)
      addr.deliveryInstructions = data.deliveryInstructions.trim();
    if (data.isDefault !== undefined) addr.isDefault = data.isDefault;
    if (data.gpsLatitude !== undefined) addr.gpsLatitude = data.gpsLatitude;
    if (data.gpsLongitude !== undefined) addr.gpsLongitude = data.gpsLongitude;
    memoryAddresses.set(addressId, { ...addr });
    return addr;
  }

  return null;
}

/**
 * Deletes a delivery address
 */
export async function deleteCustomerAddress(addressId: string, userId: string): Promise<boolean> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      await prisma.deliveryAddress.delete({
        where: { id: addressId },
      });
      memoryAddresses.delete(addressId);
      return true;
    } catch {
      // Fallback
    }
  }

  const addr = memoryAddresses.get(addressId);
  if (addr && addr.userId === userId) {
    memoryAddresses.delete(addressId);
    return true;
  }

  return false;
}

/**
 * Sets an address as the default delivery location
 */
export async function setDefaultCustomerAddress(addressId: string, userId: string): Promise<boolean> {
  return !!(await updateCustomerAddress(addressId, userId, { isDefault: true }));
}
