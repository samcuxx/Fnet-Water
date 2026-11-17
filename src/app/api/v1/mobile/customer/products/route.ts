import { getActiveProducts } from "@/lib/product-store";
import { mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function GET(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request, ["CUSTOMER", "AGENT"]);
    if (!authResult.ok) return authResult.response;

    const products = await getActiveProducts();
    return mobileSuccess(
      {
        products,
        total: products.length,
      },
      200,
      "Products loaded successfully."
    );
  } catch (error) {
    console.error("[Mobile API customer/products GET error]:", error);
    return mobileError("SERVER_ERROR", "Failed to load products catalog.", 500);
  }
}
