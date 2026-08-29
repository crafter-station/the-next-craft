import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type InvitationRecipient = {
  fullName: string;
  firstName: string;
  role: "mentor" | "judge";
  slug: string;
  to: readonly string[];
  cc: readonly string[];
  personalization: string;
  socialImage?: string;
};

const recipients = {
  terry: {
    fullName: "Terry Cruz Melo",
    firstName: "Terry",
    role: "mentor",
    slug: "terry-cruz-melo",
    to: ["terry.cruz@yalo.com"],
    cc: ["terry@cruz.pe", "shiara@crafterstation.com"],
    personalization:
      "Tu experiencia como CTO y co-founder de YaVendió, construyendo sistemas de IA generativa y agentes conversacionales a escala, puede aportar una perspectiva excepcional a los equipos que estarán tomando decisiones de producto, arquitectura y ejecución bajo presión.",
  },
  fausto: {
    fullName: "Fausto Rolandi",
    firstName: "Fausto",
    role: "judge",
    slug: "fausto-rolandi",
    to: ["fausto@heyrabbit.app"],
    cc: ["shiara@crafterstation.com"],
    personalization:
      "Tu experiencia organizando Vibe a Startup, construyendo comunidades de jóvenes founders y creando experiencias donde niños y jóvenes pasan de consumir tecnología a construir con IA puede aportar una perspectiva excepcional para reconocer productos con intención, creatividad y ejecución real.",
  },
  daniel: {
    fullName: "Daniel LeSage",
    firstName: "Daniel",
    role: "judge",
    slug: "daniel-lesage",
    to: ["me@daniellesage.com"],
    cc: ["shiara@crafterstation.com", "anthony@crafterstation.com"],
    personalization:
      "Tus más de 15 años construyendo software, liderando equipos y definiendo arquitecturas, junto con tu trabajo en Deverr conectando talento latinoamericano con equipos globales, te dan una perspectiva excepcional para reconocer productos técnicamente sólidos, útiles y construidos por equipos con verdadero sentido de propiedad.",
    socialImage:
      "public/brand-assets/social/roles/judges/daniel-lesage-linkedin-4x5.png",
  },
  nahuel: {
    fullName: "Nahuel Alberti",
    firstName: "Nahuel",
    role: "judge",
    slug: "nahuel-alberti",
    to: ["nahue@paisanos.io"],
    cc: ["shiara@crafterstation.com", "anthony@crafterstation.com"],
    personalization:
      "Tu experiencia liderando producto e ingeniería en Paisanos, construyendo y escalando equipos y llevando productos digitales a millones de usuarios, te da una perspectiva excepcional para reconocer proyectos con criterio técnico, intención de producto y una ejecución que realmente llegue hasta el final.",
  },
} as const satisfies Record<string, InvitationRecipient>;

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const recipientKey = argument("--recipient");
if (!recipientKey || !(recipientKey in recipients)) {
  throw new Error(
    `Provide --recipient ${Object.keys(recipients)
      .map((key) => `"${key}"`)
      .join(", ")}.`,
  );
}

const recipient: InvitationRecipient =
  recipients[recipientKey as keyof typeof recipients];
const shouldSend = process.argv.includes("--send");
const role =
  recipient.role === "mentor"
    ? {
        noun: "mentor",
        label: "MENTOR OFICIAL",
        headline:
          "queremos que acompañes a quienes están construyendo lo próximo.",
        schedule: "Mentorías desde las 11:00 · bloque final por coordinar",
        logistics:
          "La dirección de la sede, acreditación y bloque exacto de mentorías se compartirán directamente antes del evento.",
        closing:
          "Gracias por acompañar a quienes están construyendo lo próximo.",
      }
    : {
        noun: "jurado",
        label: "JURADO OFICIAL",
        headline:
          "queremos contar con tu criterio para reconocer lo que llegue más lejos.",
        schedule: "Demos desde las 20:15 · deliberación final",
        logistics:
          "La dirección de la sede, acreditación, rúbrica y dinámica de evaluación se compartirán directamente antes del evento.",
        closing:
          "Gracias por ayudarnos a reconocer los productos que lleguen más lejos.",
      };
const from = "The Next Craft <hola@crafterstation.com>";
const replyTo = "shiara@crafterstation.com";
const subject = `Invitación formal: ${role.noun} en The Next Craft`;
const siteUrl = "https://thenextcraft.org";
const attachmentFilename = `invitacion-${role.noun}-${recipient.slug}.pdf`;
const attachmentPath = path.resolve(
  "docs",
  "invitations",
  `${recipient.slug}-${recipient.role}.pdf`,
);

let attachmentContent: Buffer;
try {
  attachmentContent = await readFile(attachmentPath);
} catch {
  throw new Error(
    `Missing ${recipient.fullName}'s invitation PDF. Generate it before preparing the email.`,
  );
}

const socialImagePath = recipient.socialImage
  ? path.resolve(recipient.socialImage)
  : undefined;
const socialImageContent = socialImagePath
  ? await readFile(socialImagePath)
  : undefined;
const socialInvitation = socialImageContent
  ? "\n\nTambién adjuntamos tu imagen oficial como jurado. Si te provoca, nos encantaría que la compartas en tus redes. Nosotros también la publicaremos desde Crafter Station y te etiquetaremos."
  : "";

const text = `Hola ${recipient.firstName},

Queremos invitarte formalmente a participar como ${role.noun} oficial de The Next Craft, la hackathon presencial de Crafter Station que reunirá a 300 builders trabajando en simultáneo desde cinco ciudades de Latinoamérica.

${recipient.personalization}

The Next Craft
Sábado 29 de agosto de 2026
Sede Lima · ubicación final por confirmar
${role.schedule}

Adjuntamos la invitación formal con los detalles del rol. Por favor, responde a este correo para confirmar tu participación. ${role.logistics}${socialInvitation}

Más información: ${siteUrl}

${role.closing}

Shiara Arauzo y Anthony Cueva
Crafter Station`;

const html = `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:32px 12px;background:#f3f3f0;color:#1a1a17;font-family:Arial,Helvetica,sans-serif">
    <main style="max-width:600px;margin:0 auto;background:#ffffff;border-top:4px solid #1a1a17">
      <header style="padding:28px 36px;background:#e8e8e4;border-bottom:1px solid #d1d1cc">
        <p style="margin:0 0 8px;color:#686862;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.2px">10 PRINT &quot;INVITACIÓN FORMAL&quot;</p>
        <p style="margin:0;font-family:'Brush Script MT','Segoe Script',cursive;font-size:34px;line-height:1">the next craft</p>
      </header>

      <div style="padding:36px">
        <p style="display:inline-block;margin:0;padding:7px 10px;background:#f3f3f0;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.2px">${role.label}</p>
        <h1 style="margin:24px 0 20px;font-size:32px;line-height:1.12;letter-spacing:-0.8px">${recipient.firstName}, ${role.headline}</h1>

        <p style="margin:0 0 14px;font-size:15px;line-height:1.65">Queremos invitarte formalmente a participar como ${role.noun} oficial de <strong>The Next Craft</strong>, la hackathon presencial de Crafter Station que reunirá a 300 builders trabajando en simultáneo desde cinco ciudades de Latinoamérica.</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.65">${recipient.personalization}</p>

        <section style="margin:0 0 24px;padding:18px 20px;background:#f3f3f0">
          <p style="margin:0 0 12px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:1.2px">DATOS DEL EVENTO</p>
          <p style="margin:0;font-size:14px;line-height:1.75"><strong>Sábado 29 de agosto de 2026</strong><br>Sede Lima · ubicación final por confirmar<br>${role.schedule}</p>
        </section>

        <p style="margin:0 0 20px;font-size:15px;line-height:1.65">Adjuntamos la invitación formal con los detalles del rol. Por favor, responde a este correo para confirmar tu participación. ${role.logistics}</p>
        ${socialImageContent ? '<p style="margin:0 0 20px;font-size:15px;line-height:1.65">También adjuntamos tu imagen oficial como jurado. Si te provoca, nos encantaría que la compartas en tus redes. Nosotros también la publicaremos desde Crafter Station y te etiquetaremos.</p>' : ""}
        <p style="margin:0 0 28px"><a href="${siteUrl}" style="display:inline-block;padding:13px 18px;background:#1a1a17;color:#ffffff;font-family:'Courier New',monospace;font-size:12px;font-weight:700;letter-spacing:1px;text-decoration:none">VER THE NEXT CRAFT</a></p>

        <p style="margin:0;font-size:15px;line-height:1.65">${role.closing}</p>
        <p style="margin:18px 0 0;font-size:15px;line-height:1.55"><strong>Shiara Arauzo y Anthony Cueva</strong><br><span style="color:#686862">Crafter Station</span></p>
      </div>
    </main>
  </body>
</html>`;

const resendPayload = {
  from,
  to: recipient.to,
  cc: recipient.cc,
  reply_to: replyTo,
  subject,
  html,
  text,
  attachments: [
    {
      filename: attachmentFilename,
      content: attachmentContent.toString("base64"),
    },
    ...(socialImageContent
      ? [
          {
            filename: `${recipient.slug}-jurado-oficial.png`,
            content: socialImageContent.toString("base64"),
          },
        ]
      : []),
  ],
};

const outputDirectory = path.resolve(
  ".email-output",
  `${recipient.slug}-${recipient.role}`,
);
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDirectory, "email.html"), html),
  writeFile(path.join(outputDirectory, "email.txt"), text),
  writeFile(
    path.join(outputDirectory, "resend-payload.json"),
    `${JSON.stringify(resendPayload, null, 2)}\n`,
  ),
]);

console.log(`To: ${recipient.to.join(", ")}`);
console.log(`Cc: ${recipient.cc.join(", ")}`);
console.log(`Reply-To: ${replyTo}`);
console.log(`Subject: ${subject}`);
console.log(`Attachment: ${attachmentFilename}`);
if (socialImageContent) {
  console.log(`Attachment: ${recipient.slug}-jurado-oficial.png`);
}
console.log(
  `Preview: ${path.relative(process.cwd(), outputDirectory)}/email.html`,
);
console.log(
  `Payload: ${path.relative(process.cwd(), outputDirectory)}/resend-payload.json`,
);

if (!shouldSend) {
  console.log("DRY RUN ONLY · no request was sent to Resend");
} else {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resendPayload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      `Resend rejected the email (${response.status}): ${JSON.stringify(result)}`,
    );
  }

  console.log(`SENT · Resend message ${result.id}`);
}
