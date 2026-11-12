import { prisma } from "@/lib/prisma";
import { isDatabaseConnected } from "@/lib/auth-store";

export type ProductType = "REFILLABLE_BOTTLE" | "TAKEAWAY_BOTTLE" | "BULK_SUPPLY";

export interface StoredProduct {
  id: string;
  name: string;
  type: ProductType;
  description: string;
  price: number; // in GH₵
  depositFee: number; // in GH₵ (applies to refillable bottles if no return)
  stockQuantity: number;
  image?: string;
  isActive: boolean;
  unit: string;
  createdAt: string;
}

const DEFAULT_SEED_PRODUCTS: StoredProduct[] = [
  {
    id: "prod_001",
    name: "18.9L Refill Bottle",
    type: "REFILLABLE_BOTTLE",
    description: "A reusable bottle that customers return or bring back to be refilled.",
    price: 25.0,
    depositFee: 80.0,
    stockQuantity: 450,
    unit: "bottle",
    image: "/images/product/fnet-18l-bottle.jpg",
    isActive: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "prod_001_non_refill",
    name: "18.9L Non-Refill Bottle",
    type: "TAKEAWAY_BOTTLE",
    description: "A new bottle sold as a single-use product. Customers do not return it for refilling.",
    price: 105.0,
    depositFee: 0.0,
    stockQuantity: 280,
    unit: "bottle",
    image: "/images/product/fnet-18l-bottle.jpg",
    isActive: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "prod_002",
    name: "500ml Bottled Water (Pack of 24)",
    type: "TAKEAWAY_BOTTLE",
    description: "Single-use bottled water pack. Customers do not return it for refilling.",
    price: 35.0,
    depositFee: 0.0,
    stockQuantity: 320,
    unit: "pack",
    image: "/images/product/fnet-water-bottles-pack.jpg",
    isActive: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "prod_003",
    name: "750ml Premium Bottled Water (Pack of 16)",
    type: "TAKEAWAY_BOTTLE",
    description: "Single-use mineral water pack for dining and events. Customers do not return for refilling.",
    price: 40.0,
    depositFee: 0.0,
    stockQuantity: 180,
    unit: "pack",
    image: "/images/product/fnet-water-bottles-pack.jpg",
    isActive: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "prod_004",
    name: "Commercial Water Supply (1,000L Tanker)",
    type: "BULK_SUPPLY",
    description: "Dedicated food-grade water tanker delivery for overhead and underground tanks.",
    price: 450.0,
    depositFee: 0.0,
    stockQuantity: 45,
    unit: "1,000L",
    image: "/images/logistics/delivery-van.jpg",
    isActive: true,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
];

const globalForProducts = globalThis as unknown as {
  memoryProducts?: Map<string, StoredProduct>;
};

const memoryProducts: Map<string, StoredProduct> = (() => {
  if (globalForProducts.memoryProducts) {
    for (const p of DEFAULT_SEED_PRODUCTS) {
      if (!globalForProducts.memoryProducts.has(p.id)) {
        globalForProducts.memoryProducts.set(p.id, { ...p });
      }
    }
    return globalForProducts.memoryProducts;
  }
  const map = new Map<string, StoredProduct>(DEFAULT_SEED_PRODUCTS.map((p) => [p.id, { ...p }]));
  if (process.env.NODE_ENV !== "production") {
    globalForProducts.memoryProducts = map;
  }
  return map;
})();

/**
 * Get all active products
 */
export async function getActiveProducts(): Promise<StoredProduct[]> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const dbProducts = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });
      if (dbProducts.length > 0) {
        return dbProducts.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type as ProductType,
          description: p.description || "",
          price: p.price,
          depositFee: p.depositFee,
          stockQuantity: p.stockQuantity,
          image: p.image || undefined,
          isActive: p.isActive,
          unit: p.type === "REFILLABLE_BOTTLE" ? "bottle" : p.type === "BULK_SUPPLY" ? "1,000L" : "pack",
          createdAt: p.createdAt.toISOString(),
        }));
      }
    } catch {
      // Fallback to memory
    }
  }

  return Array.from(memoryProducts.values()).filter((p) => p.isActive);
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<StoredProduct | null> {
  const dbOnline = await isDatabaseConnected();
  if (dbOnline) {
    try {
      const p = await prisma.product.findUnique({ where: { id } });
      if (p) {
        return {
          id: p.id,
          name: p.name,
          type: p.type as ProductType,
          description: p.description || "",
          price: p.price,
          depositFee: p.depositFee,
          stockQuantity: p.stockQuantity,
          image: p.image || undefined,
          isActive: p.isActive,
          unit: p.type === "REFILLABLE_BOTTLE" ? "bottle" : p.type === "BULK_SUPPLY" ? "1,000L" : "pack",
          createdAt: p.createdAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }
  }

  return memoryProducts.get(id) || null;
}
