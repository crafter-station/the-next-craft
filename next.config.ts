import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // El sitio anterior vivía bajo /es y /en (next-intl). Esas URLs siguen
    // en marcadores, historiales y buscadores → redirigir al root.
    return [
      {
        source: "/es",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/es/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
