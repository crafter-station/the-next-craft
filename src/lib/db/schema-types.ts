import type { dashboardTrack } from "./schema";

/** Alias legible del enum del esquema, para no arrastrar todo el schema. */
export type TrackKey = (typeof dashboardTrack.enumValues)[number];
