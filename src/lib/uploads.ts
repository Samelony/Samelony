import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB per file
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function safeExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "";
}

export async function saveUploadedFiles(
  orderId: string,
  files: File[]
): Promise<string[]> {
  if (files.length === 0) return [];

  const dir = path.join(UPLOADS_ROOT, orderId);
  await mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`${file.name} is too large (max 15MB per file)`);
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      throw new Error(`${file.name} has an unsupported file type`);
    }
    const filename = `${randomUUID()}${safeExtension(file.name)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), bytes);
    urls.push(`/uploads/${orderId}/${filename}`);
  }
  return urls;
}
