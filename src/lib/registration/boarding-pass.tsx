// Boarding pass compartible — se envía por WhatsApp al completar el registro.
// Misma lengua visual que los OG images: Klein blue, grid blueprint, mono.

import { ImageResponse } from "next/og";

const BLUE = "#002FA7";
const INK = "#0A1633";
const GRAY = "#5B6478";

export function boardingPassImage(params: {
  code: string;
  name: string;
  role: string;
}): ImageResponse {
  const { code, name, role } = params;
  return new ImageResponse(
    <div
      style={{
        width: "1080px",
        height: "1080px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundImage:
          "linear-gradient(rgba(0,47,167,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,47,167,0.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        padding: "64px",
      }}
    >
      {/* Marco */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: `3px solid ${BLUE}`,
          padding: "56px",
          backgroundColor: "rgba(255,255,255,0.85)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: "20px",
            letterSpacing: "0.15em",
            color: GRAY,
          }}
        >
          <span>THE NEXT CRAFT</span>
          <span>BOARDING PASS</span>
        </div>

        {/* Código gigante */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "24px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "22px",
              letterSpacing: "0.15em",
              color: GRAY,
            }}
          >
            ASPIRANTE Nº
          </span>
          <span
            style={{
              fontSize: "120px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: BLUE,
            }}
          >
            {code}
          </span>
          <span
            style={{
              fontSize: "44px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "24px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: BLUE,
            }}
          >
            {role}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid rgba(0,47,167,0.25)`,
            paddingTop: "32px",
            fontFamily: "monospace",
            fontSize: "20px",
            letterSpacing: "0.12em",
            color: INK,
          }}
        >
          <span>24–26 JUL 2026</span>
          <span>LIMA, PERÚ</span>
          <span>36 HORAS</span>
        </div>
      </div>

      {/* Sello */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "28px",
          fontFamily: "monospace",
          fontSize: "18px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: GRAY,
        }}
      >
        THE FIRST USER CHALLENGE · ADMISIÓN EN REVISIÓN
      </div>
    </div>,
    { width: 1080, height: 1080 },
  );
}
