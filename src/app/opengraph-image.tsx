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

const SCRIPT_TITLE = "the next craft";
const SPECS = "LIMA · BOGOTÁ · GUATEMALA · 24–26 JUL 2026 · 36H";
const READY = "READY.";

export default async function OgImage() {
  const [borel, plexMono] = await Promise.all([
    loadGoogleFont("Borel", SCRIPT_TITLE),
    loadGoogleFont("IBM+Plex+Mono:wght@500", `${SPECS}${READY}█`),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#1A1A17",
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
        }}
      >
        {/* Script — letras unidas */}
        <div
          style={{
            color: "#F2F0E9",
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
            color: "#A2A096",
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
            color: "#E9E7DE",
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
