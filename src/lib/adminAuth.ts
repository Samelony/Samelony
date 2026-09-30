export const ADMIN_COOKIE_NAME = "aravelle_admin";

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "Set ADMIN_PASSWORD (and ideally ADMIN_SESSION_SECRET) to enable the admin dashboard"
    );
  }
  return secret;
}

async function hmac(value: string): Promise<string> {
  const secret = getSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(candidate: string): boolean {
  return (
    Boolean(process.env.ADMIN_PASSWORD) &&
    candidate === process.env.ADMIN_PASSWORD
  );
}

export async function createSessionToken(): Promise<string> {
  return hmac("admin-session");
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !isAdminConfigured()) return false;
  const expected = await createSessionToken();
  return token === expected;
}
