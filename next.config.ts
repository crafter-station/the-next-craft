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
    "/api/badge/generate": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
    ],
    "/api/badge/profile": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
      "./node_modules/@takumi-rs/**/*",
      "./assets/fonts/**/*",
      "./assets/brand/**/*",
    ],
    "/api/badge/portrait/[number]": [
      "./node_modules/sharp/**/*",
      "./node_modules/@img/**/*",
    ],
    "/api/badge/image/[number]": ["./assets/fonts/**/*", "./assets/brand/**/*"],
  },
  serverExternalPackages: [
    "@takumi-rs/core",
    "@takumi-rs/image-response",
    "sharp",
  ],
  experimental: {
    viewTransition: true,
  },
};

export default withNextIntl(nextConfig);
