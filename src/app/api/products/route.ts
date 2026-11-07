import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/product-store";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error("[Products GET Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load water products catalog." },
      { status: 500 }
    );
  }
}
