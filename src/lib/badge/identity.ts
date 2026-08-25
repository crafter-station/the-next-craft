import { createDecipheriv, createHash } from "node:crypto";

function identityKey() {
  const secret = process.env.BADGE_PII_ENCRYPTION_KEY;
  if (!secret) throw new Error("BADGE_PII_ENCRYPTION_KEY is required");

  return createHash("sha256").update(secret).digest();
}

export function decryptIdentityDocument(value: string): string {
  const [version, encodedIv, encodedTag, encodedDocument, extra] =
    value.split(".");
  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedDocument ||
    extra !== undefined
  ) {
    throw new Error("Invalid encrypted identity document");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    identityKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encodedDocument, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
