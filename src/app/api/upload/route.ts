import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const uploadDir = path.join(process.cwd(), "public", "uploads", "general");
    await mkdir(uploadDir, { recursive: true });

    let filename = "";
    let buffer: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || ".jpg";
      filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
    } else {
      const body = await request.json().catch(() => null);
      if (!body?.base64) {
        return NextResponse.json({ success: false, error: "No base64 provided." }, { status: 400 });
      }

      let base64Clean = body.base64;
      if (base64Clean.includes(",")) {
        base64Clean = base64Clean.split(",")[1];
      }

      buffer = Buffer.from(base64Clean, "base64");
      const ext = body.mimeType?.includes("png") ? ".png" : ".jpg";
      filename = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}${ext}`;
    }

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const relativeUrl = `/uploads/general/${filename}`;
    const fullUrl = `${proto}://${host}${relativeUrl}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fullUrl,
      filename,
    });
  } catch (error) {
    console.error("[General Upload Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to upload file." }, { status: 500 });
  }
}
