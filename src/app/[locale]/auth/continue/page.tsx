import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { findParticipantByUserId } from "@/lib/dashboard/state";
import { isPanelistEmail } from "@/lib/judging/panelists.server";
import { AUTH_CONTINUE_PATH, STAFF_HOME_PATH } from "@/lib/staff/constants";
import { isStaffEmail } from "@/lib/staff/domains.server";

export const dynamic = "force-dynamic";

/** Tras login, el servidor decide el destino sin filtrar dominios al cliente. */
export default async function AuthContinuePage({
  params,
}: PageProps<"/[locale]/auth/continue">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect(`/${locale}/badge`);
  }

  const email = session.user.email;
  if (isStaffEmail(email)) {
    redirect(`/${locale}${STAFF_HOME_PATH}`);
  }

  /*
    El panel va antes que el badge: estar en `dashboard_panelists` es una alta
    deliberada del staff para el trabajo de calificar, mientras que tener badge
    solo dice que la persona se registró. Un mentor que además se acreditó
    aterriza donde tiene tarea, no en su propio badge.

    Sin esta rama el panelista no tiene casa: no es staff ni participante, así
    que caería en `/badge` y volvería al mismo sitio en cada intento.
  */
  if (await isPanelistEmail(email)) {
    redirect(`/${locale}/judge`);
  }

  const participant = await findParticipantByUserId(session.user.id);
  if (participant) {
    redirect(`/${locale}/dashboard`);
  }

  redirect(`/${locale}/badge`);
}
