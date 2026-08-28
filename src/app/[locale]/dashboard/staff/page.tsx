import { redirect } from "@/i18n/navigation";

/** Staff vive en /admin: no requiere acreditación de participante. */
export default async function DashboardStaffRedirect({
  params,
}: PageProps<"/[locale]/dashboard/staff">) {
  const { locale } = await params;
  redirect({ href: "/admin/staff", locale });
}
