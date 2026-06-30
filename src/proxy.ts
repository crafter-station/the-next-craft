import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals, static assets, API routes, deck routes, and files with extensions
  matcher: ["/((?!api|deck|_next|_vercel|.*\\..*).*)"],
};
