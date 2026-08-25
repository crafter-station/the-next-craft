import { auth } from "@/lib/auth";
import { withBadgeRealtimeAccess } from "@/lib/badge/realtime";
import { getBadgeStudioState } from "@/lib/badge/state";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(
    await withBadgeRealtimeAccess(await getBadgeStudioState(session.user.id)),
  );
}
