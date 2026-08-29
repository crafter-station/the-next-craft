import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { findParticipantByUserId } from "@/lib/dashboard/state";
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

  const participant = await findParticipantByUserId(session.user.id);
  if (participant) {
    redirect(`/${locale}/dashboard`);
  }

  redirect(`/${locale}/badge`);
}
