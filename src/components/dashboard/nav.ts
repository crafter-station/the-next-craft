/** Secciones del dashboard. La etiqueta se traduce con `dashboard.nav.<key>`. */
export const DASHBOARD_NAV = [
  { key: "overview", href: "/dashboard", group: "event" },
  { key: "team", href: "/dashboard/team", group: "event" },
  { key: "badge", href: "/dashboard/badge", group: "event" },
  { key: "tracks", href: "/dashboard/tracks", group: "event" },
  { key: "credits", href: "/dashboard/credits", group: "resources" },
] as const;

export type DashboardNavItem = (typeof DASHBOARD_NAV)[number];
