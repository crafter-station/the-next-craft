import { BADGE_THEME } from "@/lib/badge/theme";

type BrandMark = { uri: string; ratio: number };

export type BadgeTemplateProps = {
  name: string;
  participantNumber: string;
  photoDataUri: string;
  qrDataUri: string;
  crafter: BrandMark;
  organizers: Array<BrandMark & { id: string }>;
};

function nameFontSize(name: string) {
  if (name.length > 26) return 44;
  if (name.length > 20) return 52;
  if (name.length > 14) return 60;
  return 68;
}

export function BadgeTemplate({
  name,
  participantNumber,
  photoDataUri,
  qrDataUri,
  crafter,
  organizers,
}: BadgeTemplateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: 64,
        position: "relative",
        backgroundColor: BADGE_THEME.void,
        color: BADGE_THEME.textDim,
        fontFamily: "IBM Plex Mono",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <span
          style={{
            fontFamily: "Borel",
            fontSize: 48,
            color: BADGE_THEME.textDim,
            lineHeight: 1.2,
            transform: "translateY(7px)",
          }}
        >
          the next craft
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexGrow: 1,
          alignSelf: "stretch",
          marginTop: 18,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: Takumi renders this server-side. */}
        <img
          src={photoDataUri}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 18,
          alignItems: "center",
          width: "100%",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minWidth: 0,
            fontSize: nameFontSize(name),
            fontWeight: 700,
            letterSpacing: -1,
            lineHeight: 1.08,
            textAlign: "center",
          }}
        >
          {name.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            height: 32,
            width: "100%",
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: Takumi renders this server-side. */}
          <img
            src={crafter.uri}
            width={Math.round(32 * crafter.ratio)}
            height={32}
            alt=""
          />
          {organizers.map((organizer) => (
            // biome-ignore lint/performance/noImgElement: Takumi renders this server-side.
            <img
              key={organizer.id}
              src={organizer.uri}
              width={Math.round(32 * organizer.ratio)}
              height={32}
              alt=""
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          right: 0,
          top: 0,
          width: 176,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 176,
            height: 52,
            backgroundColor: BADGE_THEME.textDim,
            color: BADGE_THEME.void,
            fontFamily: "Silkscreen",
            fontSize: 32,
            letterSpacing: 2,
            lineHeight: 1,
          }}
        >
          #{participantNumber}
        </div>
        <div
          style={{
            display: "flex",
            width: 176,
            height: 176,
            padding: 8,
            backgroundColor: BADGE_THEME.textDim,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: Takumi renders this server-side. */}
          <img src={qrDataUri} width={160} height={160} alt="" />
        </div>
      </div>
    </div>
  );
}
