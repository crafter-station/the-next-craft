import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

import { lookupApprovedGuest } from "@/lib/badge/luma";
import { db } from "@/lib/db";
import { schema } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://thenextcraft.org",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  emailAndPassword: { enabled: false },
  rateLimit: { enabled: true, window: 60, max: 10 },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  plugins: [
    emailOTP({
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      storeOTP: "hashed",
      rateLimit: { window: 60, max: 1 },
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;

        let guest = null;
        try {
          guest = await lookupApprovedGuest(email);
        } catch (error) {
          console.error(
            "Luma approval check failed before OTP delivery",
            error,
          );
        }
        if (!guest) return;

        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? "The Next Craft <hello@cueva.io>",
          to: email,
          subject: `${otp} es tu codigo para The Next Craft`,
          text: `Tu codigo de acceso es ${otp}. Expira en 10 minutos. Si no lo solicitaste, ignora este mensaje.`,
          html: `<div style="background:#1a1a17;color:#f2f0e9;font-family:monospace;padding:32px"><p>THE NEXT CRAFT // BADGE STUDIO</p><h1 style="font-size:40px;letter-spacing:8px">${otp}</h1><p>Este codigo expira en 10 minutos.</p></div>`,
        });
        if (error) throw new Error(`Resend failed: ${error.message}`);
      },
    }),
    nextCookies(),
  ],
});
