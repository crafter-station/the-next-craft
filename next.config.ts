import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/deck/[slug]": ["./src/content/decks/**/*"],
  },
  experimental: {
    viewTransition: true,
  },
};

export default withNextIntl(nextConfig);
