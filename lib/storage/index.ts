import "server-only";

import { randomUUID } from "node:crypto";

import { Client as MinioClient } from "minio";

import { prisma } from "@/lib/db";
import { ProviderError, ValidationError } from "@/lib/errors";
import { FileVisibility } from "@/lib/generated/prisma/enums";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/validation/common";

/**
 * Object storage.
 *
 * Binary files live in MinIO; PostgreSQL holds only metadata and the object
 * key. Buckets are private — reads go through an authorized route handler or a
 * short-lived presigned URL, never a publicly listable bucket.
 */

let client: MinioClient | null = null;

function getClient(): MinioClient {
  if (client) return client;

  const endPoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endPoint || !accessKey || !secretKey) {
    throw new ProviderError(
      "File storage is not configured. Set MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY.",
    );
  }

  client = new MinioClient({
    endPoint,
    port: Number.parseInt(process.env.MINIO_PORT ?? "9000", 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey,
    secretKey,
  });

  return client;
}

export function bucketName(): string {
  return process.env.MINIO_BUCKET ?? "fnet-water-hub";
}

/** Creates the bucket if absent. Safe to call repeatedly. */
export async function ensureBucket(): Promise<void> {
  const minio = getClient();
  const bucket = bucketName();

  if (!(await minio.bucketExists(bucket))) {
    await minio.makeBucket(bucket);
  }
}

export type UploadCategory =
  | "product-images"
  | "dispenser-images"
  | "payment-evidence"
  | "support-attachments"
  | "customer-uploads"
  | "system-documents";

const IMAGE_CATEGORIES: ReadonlySet<UploadCategory> = new Set([
  "product-images",
  "dispenser-images",
]);

/**
 * Validates an upload before a byte is written.
 *
 * The declared content type is checked against an allow-list and the size
 * against a hard cap. The stored key is generated rather than derived from the
 * user-supplied filename, so a crafted name cannot escape its prefix.
 */
function assertUploadAllowed(
  file: { name: string; size: number; type: string },
  category: UploadCategory,
): void {
  if (file.size <= 0) {
    throw new ValidationError("The selected file is empty.", {
      file: ["The selected file is empty."],
    });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ValidationError("Files must be 5 MB or smaller.", {
      file: ["Files must be 5 MB or smaller."],
    });
  }

  const allowed: readonly string[] = IMAGE_CATEGORIES.has(category)
    ? ALLOWED_IMAGE_TYPES
    : ALLOWED_DOCUMENT_TYPES;

  if (!allowed.includes(file.type)) {
    throw new ValidationError(
      `Unsupported file type. Allowed: ${allowed.join(", ")}.`,
      { file: [`Unsupported file type. Allowed: ${allowed.join(", ")}.`] },
    );
  }
}

function extensionFor(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };

  return map[contentType] ?? "bin";
}

export type StoredFileRecord = {
  id: string;
  objectKey: string;
  originalName: string;
  contentType: string;
  size: number;
};

export type UploadOptions = {
  category: UploadCategory;
  file: File;
  uploadedByUserId?: string | null;
  visibility?: FileVisibility;
  entityType?: string;
  entityId?: string;
};

/** Streams a validated file into MinIO and records its metadata. */
export async function uploadFile({
  category,
  file,
  uploadedByUserId,
  visibility = FileVisibility.PRIVATE,
  entityType,
  entityId,
}: UploadOptions): Promise<StoredFileRecord> {
  assertUploadAllowed(
    { name: file.name, size: file.size, type: file.type },
    category,
  );

  await ensureBucket();

  const objectKey = `${category}/${new Date().getFullYear()}/${randomUUID()}.${extensionFor(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await getClient().putObject(bucketName(), objectKey, buffer, buffer.byteLength, {
    "Content-Type": file.type,
  });

  const record = await prisma.storedFile.create({
    data: {
      objectKey,
      bucket: bucketName(),
      originalName: file.name.slice(0, 255),
      contentType: file.type,
      size: buffer.byteLength,
      visibility,
      entityType,
      entityId,
      uploadedByUserId: uploadedByUserId ?? null,
    },
    select: {
      id: true,
      objectKey: true,
      originalName: true,
      contentType: true,
      size: true,
    },
  });

  return record;
}

/**
 * Issues a short-lived presigned URL.
 *
 * The caller must have already authorized access to the owning record — this
 * function does not perform authorization itself.
 */
export async function presignedDownloadUrl(
  objectKey: string,
  expirySeconds = 300,
): Promise<string> {
  return getClient().presignedGetObject(bucketName(), objectKey, expirySeconds);
}

/** Reads an object into memory for streaming through an authorized route. */
export async function getObjectBuffer(objectKey: string): Promise<Buffer> {
  const stream = await getClient().getObject(bucketName(), objectKey);
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export async function deleteFile(objectKey: string): Promise<void> {
  await getClient().removeObject(bucketName(), objectKey);
  await prisma.storedFile.deleteMany({ where: { objectKey } });
}

/** True when storage credentials are present. Used for health reporting. */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.MINIO_ENDPOINT &&
      process.env.MINIO_ACCESS_KEY &&
      process.env.MINIO_SECRET_KEY,
  );
}
