/** Secciones del dashboard. La etiqueta se traduce con `dashboard.nav.<key>`. */
export const DASHBOARD_NAV = [
  { key: "overview", href: "/dashboard", group: "event" },
  { key: "team", href: "/dashboard/team", group: "event" },
  { key: "agenda", href: "/dashboard/agenda", group: "event" },
  { key: "badge", href: "/dashboard/badge", group: "event" },
  { key: "tracks", href: "/dashboard/tracks", group: "event" },
  { key: "mentors", href: "/dashboard/mentors", group: "resources" },
  { key: "credits", href: "/dashboard/credits", group: "resources" },
  { key: "support", href: "/dashboard/support", group: "resources" },
  // Solo se pinta para staff; ver `DashboardSidebar`.
  { key: "staff", href: "/dashboard/staff", group: "staff" },
] as const;

export type DashboardNavItem = (typeof DASHBOARD_NAV)[number];
