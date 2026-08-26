import type { dashboardQrTargetMode, dashboardTrack } from "./schema";

/** Alias legibles de los enums del esquema, para no arrastrar todo el schema. */
export type TrackKey = (typeof dashboardTrack.enumValues)[number];
export type QrTargetMode = (typeof dashboardQrTargetMode.enumValues)[number];
