import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Next Craft — Hackathon por Crafter Station × Next";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "sans-serif",
        backgroundImage:
          "linear-gradient(rgba(0,47,167,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,47,167,0.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      {/* Corner marks */}
      <span
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#002FA7",
          fontSize: "20px",
          fontFamily: "monospace",
          lineHeight: 1,
        }}
      >
        +
      </span>
      <span
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          color: "#002FA7",
          fontSize: "20px",
          fontFamily: "monospace",
          lineHeight: 1,
        }}
      >
        +
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          color: "#002FA7",
          fontSize: "20px",
          fontFamily: "monospace",
          lineHeight: 1,
        }}
      >
        +
      </span>
      <span
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          color: "#002FA7",
          fontSize: "20px",
          fontFamily: "monospace",
          lineHeight: 1,
        }}
      >
        +
      </span>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          gap: "24px",
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            color: "#002FA7",
            fontSize: "96px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          THE NEXT CRAFT
        </div>

        <div
          style={{
            color: "#0A1633",
            fontSize: "22px",
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            textAlign: "center",
          }}
        >
          24–26 JUL 2026 · LIMA, PERÚ · 36 HORAS
        </div>
      </div>

      {/* Footer bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid rgba(0,47,167,0.2)",
          padding: "20px 80px",
          backgroundColor: "rgba(0,47,167,0.04)",
        }}
      >
        <span
          style={{
            color: "#5B6478",
            fontSize: "14px",
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          CRAFTER STATION × NEXT
        </span>
      </div>
    </div>,
    size,
  );
}
