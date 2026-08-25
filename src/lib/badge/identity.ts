import { createCipheriv, createHash, randomBytes } from "node:crypto";

export function encryptIdentityDocument(value: string): string {
  const secret = process.env.BADGE_PII_ENCRYPTION_KEY;
  if (!secret) throw new Error("BADGE_PII_ENCRYPTION_KEY is required");

  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return ["v1", iv, tag, encrypted]
    .map((part) =>
      typeof part === "string" ? part : part.toString("base64url"),
    )
    .join(".");
}
