import "server-only";

import { auth as triggerAuth } from "@trigger.dev/sdk";

import type { BadgeStudioState } from "./state";

export async function withBadgeRealtimeAccess(
  state: BadgeStudioState,
): Promise<BadgeStudioState> {
  if (state.stage !== "generating" || !state.runId) return state;

  const publicAccessToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [state.runId] } },
    expirationTime: "1h",
    realtime: { skipColumns: ["payload", "output"] },
  });

  return { ...state, publicAccessToken };
}
