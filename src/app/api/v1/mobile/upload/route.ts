import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getRequestOrigin, mobileError, mobileSuccess, verifyMobileAuth } from "@/lib/mobile-auth";

export async function POST(request: Request) {
  try {
    const authResult = await verifyMobileAuth(request);
    if (!authResult.ok) return authResult.response;

    const contentType = request.headers.get("content-type") || "";
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    let filename = "";
    let buffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return mobileError("BAD_REQUEST", "No file provided in form-data.", 400);
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      mimeType = file.type || "image/jpeg";

      const ext = path.extname(file.name) || (mimeType.includes("png") ? ".png" : ".jpg");
      filename = `avatar-${authResult.user.id}-${Date.now()}${ext}`;
    } else {
      // JSON base64 upload
      const body = await request.json().catch(() => null);
      if (!body?.base64) {
        return mobileError("BAD_REQUEST", "Provide a file or base64 data to upload.", 400);
      }

      let base64Clean = body.base64;
      if (base64Clean.includes(",")) {
        base64Clean = base64Clean.split(",")[1];
      }

      buffer = Buffer.from(base64Clean, "base64");
      mimeType = body.mimeType || "image/jpeg";
      const ext = mimeType.includes("png") ? ".png" : ".jpg";
      filename = `avatar-${authResult.user.id}-${Date.now()}${ext}`;
    }

    if (!buffer || buffer.length === 0) {
      return mobileError("BAD_REQUEST", "Uploaded file buffer is empty.", 400);
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const relativeUrl = `/uploads/avatars/${filename}`;
    const origin = getRequestOrigin(request);
    const fullUrl = `${origin}${relativeUrl}`;

    return mobileSuccess(
      {
        url: relativeUrl,
        fullUrl,
        filename,
        size: buffer.length,
        mimeType,
      },
      201,
      "Avatar uploaded successfully."
    );
  } catch (error) {
    console.error("[Mobile Upload Error]:", error);
    return mobileError("SERVER_ERROR", "Failed to upload image.", 500);
  }
}
