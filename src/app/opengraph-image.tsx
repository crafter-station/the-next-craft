import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Next Craft — Hackathon por Crafter Station × Next";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Carga una fuente de Google Fonts en runtime (edge): pide el CSS y
 * extrae la URL del ttf/otf. Patrón estándar para satori/ImageResponse.
 */
async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype)'\)/,
  );
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }
  throw new Error(`failed to load font: ${family}`);
}

const BOOT_HEADER = "**** THE NEXT CRAFT 64 ****";
const BOOT_SUB = "64K RAM SYSTEM · 36 HORAS FREE · LIMA BASIC V2";
const SCRIPT_TITLE = "the next craft";
const SPECS = "24–26 JUL 2026 · LIMA, PERÚ · 150 HACKERS";
const READY = "READY.";

export default async function OgImage() {
  const [silkscreen, borel, plexMono] = await Promise.all([
    loadGoogleFont("Silkscreen:wght@700", BOOT_HEADER),
    loadGoogleFont("Borel", SCRIPT_TITLE),
    loadGoogleFont("IBM+Plex+Mono:wght@500", `${BOOT_SUB}${SPECS}${READY}█`),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#14102B",
        display: "flex",
        padding: "28px",
      }}
    >
      {/* Marco de monitor C64 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "26px",
          backgroundColor: "#40318D",
          border: "18px solid #7869C4",
          borderRadius: "16px",
        }}
      >
        {/* Boot header */}
        <div
          style={{
            color: "#A99BE8",
            fontSize: "34px",
            fontFamily: "Silkscreen",
            display: "flex",
          }}
        >
          {BOOT_HEADER}
        </div>
        <div
          style={{
            color: "#CDC8E8",
            fontSize: "19px",
            fontFamily: "IBM Plex Mono",
            letterSpacing: "0.14em",
            display: "flex",
          }}
        >
          {BOOT_SUB}
        </div>

        {/* Script — letras unidas */}
        <div
          style={{
            color: "#EAE7F8",
            fontSize: "110px",
            fontFamily: "Borel",
            lineHeight: 1.3,
            display: "flex",
            paddingTop: "10px",
          }}
        >
          {SCRIPT_TITLE}
        </div>

        {/* Specs */}
        <div
          style={{
            color: "#CDC8E8",
            fontSize: "21px",
            fontFamily: "IBM Plex Mono",
            letterSpacing: "0.14em",
            display: "flex",
          }}
        >
          {SPECS}
        </div>

        {/* READY. + cursor */}
        <div
          style={{
            color: "#A99BE8",
            fontSize: "22px",
            fontFamily: "IBM Plex Mono",
            display: "flex",
            alignSelf: "flex-start",
            paddingLeft: "60px",
            gap: "4px",
          }}
        >
          {READY}█
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Silkscreen",
          data: silkscreen,
          weight: 700,
          style: "normal",
        },
        {
          name: "Borel",
          data: borel,
          weight: 400,
          style: "normal",
        },
        {
          name: "IBM Plex Mono",
          data: plexMono,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
