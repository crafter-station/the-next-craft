import type { CityKey } from "@/lib/cities";

export const LUMA_EVENT_CITIES = {
  "evt-pI2evFs4871pnFC": "lima",
  "evt-VY39qs3m0xyxTDK": "salvador",
  "evt-pGqaBUD60Epdarr": "guatemala",
  "evt-yOQFvwUmtTrKAA0": "bogota",
  "evt-1MGHQUyZRTbetjz": "arequipa",
} as const satisfies Record<string, CityKey>;
export const TERMS_VERSION = "2026-08-24";
export const GENERATION_RATE_LIMIT_MINUTES = 15;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const BADGE_WIDTH = 1080;
export const BADGE_HEIGHT = 1350;
