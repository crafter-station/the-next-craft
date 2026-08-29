import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

import { lookupApprovedGuest } from "@/lib/badge/luma";
import { db } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { isPanelistEmail } from "@/lib/judging/panelists.server";
import { isStaffEmail } from "@/lib/staff/domains.server";

/** Sin credenciales no se registra el proveedor: en local nadie las tiene. */
function githubProvider() {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return {};
  return { github: { clientId, clientSecret, disableSignUp: true } };
}

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
  /*
    GitHub no es una puerta de entrada: `disableSignUp` deja fuera a quien no
    tenga ya una cuenta creada por el OTP, que es el que comprueba la
    aprobación en Luma. Aquí solo sirve para vincular la cuenta a una
    acreditación existente y poder invitarla al repo de su equipo.

    `allowDifferentEmails` es obligatorio: el correo con el que uno se registra
    en un hackathon casi nunca es el de su GitHub.
  */
  socialProviders: githubProvider(),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"],
      allowDifferentEmails: true,
    },
  },
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
        /*
          Tres puertas, no una: invitado aprobado en Luma (el hacker), correo
          del dominio de la organización (el staff), o lista blanca de panel
          (mentores y jurados). Los panelistas no son ninguna de las dos
          primeras cosas —no se registraron al evento y no llevan nuestro
          correo—, así que sin esta tercera comprobación no podrían ni pedir el
          código para entrar a calificar.
        */
        const panelist = guest ? false : await isPanelistEmail(email);
        if (!guest && !isStaffEmail(email) && !panelist) return;

        const resend = new Resend(process.env.RESEND_API_KEY);
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
