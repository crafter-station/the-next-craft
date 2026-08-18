import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/SvwR4Pkyn",
        permanent: false,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/deck/[slug]": ["./src/content/decks/**/*"],
  },
  experimental: {
    viewTransition: true,
  },
};

export default withNextIntl(nextConfig);
