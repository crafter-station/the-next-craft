import { redirect } from "@/i18n/navigation";

export default async function AdminIndexPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  redirect({ href: "/admin/staff", locale });
}
