import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Social share card used for SMS, iMessage, link unfurls, and social previews.
// 1200×630 is the standard Open Graph / Twitter "summary_large_image" size.
export const alt =
  "SummerSharp — playful K–5 summer learning in math, reading & science";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (mirrors globals.css design tokens).
const ORANGE = "#f57c1f";
const BLUE = "#1d70c2";
const SUN = "#ffc223";
const WAVE = "#2aa7e6";
const PALM = "#3fb24b";

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 22px",
        background: "#ffffff",
        border: "2px solid #eef2f7",
        borderRadius: 999,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
        fontFamily: "Nunito",
        fontWeight: 800,
        fontSize: 28,
        color: "#475569",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: color,
        }}
      />
      {label}
    </div>
  );
}

export default async function Image() {
  const og = join(process.cwd(), "src/app/_og-assets");
  const [mascot, fredoka600, fredoka700, nunito700, nunito800] =
    await Promise.all([
      readFile(join(process.cwd(), "public/summersharplogo.png")),
      readFile(join(og, "fredoka-600.ttf")),
      readFile(join(og, "fredoka-700.ttf")),
      readFile(join(og, "nunito-700.ttf")),
      readFile(join(og, "nunito-800.ttf")),
    ]);
  const mascotSrc = `data:image/png;base64,${mascot.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #eaf6ff 0%, #fff7e8 55%, #fff0f6 100%)",
          overflow: "hidden",
        }}
      >
        {/* Warm sun glow behind the mascot */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -160,
            width: 760,
            height: 760,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(255,194,35,0.42) 0%, rgba(255,194,35,0) 68%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            padding: "0 78px",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Mascot */}
          <div style={{ display: "flex", flexShrink: 0 }}>
            <img
              src={mascotSrc}
              width={430}
              height={430}
              alt=""
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Copy */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Fredoka",
                fontWeight: 700,
                fontSize: 96,
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              <span style={{ color: ORANGE }}>Summer</span>
              <span style={{ color: BLUE }}>Sharp</span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontFamily: "Fredoka",
                fontWeight: 600,
                fontSize: 46,
                color: "#334155",
              }}
            >
              Stay sharp all summer.
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontFamily: "Nunito",
                fontWeight: 700,
                fontSize: 30,
                color: "#64748b",
              }}
            >
              Playful K–5 practice — earn points, keep your streak, unlock badges.
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
              <Chip color={BLUE} label="Math" />
              <Chip color={ORANGE} label="Reading" />
              <Chip color={PALM} label="Science" />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 40,
                fontFamily: "Nunito",
                fontWeight: 800,
                fontSize: 28,
              }}
            >
              <span style={{ color: BLUE }}>summersharp.app</span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#cbd5e1",
                  display: "flex",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>
                Florida K–5
              </span>
            </div>
          </div>
        </div>

        {/* Brand accent strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 14,
            display: "flex",
            background: `linear-gradient(90deg, ${ORANGE}, ${SUN}, ${PALM}, ${WAVE}, ${BLUE})`,
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fredoka", data: fredoka600, style: "normal", weight: 600 },
        { name: "Fredoka", data: fredoka700, style: "normal", weight: 700 },
        { name: "Nunito", data: nunito700, style: "normal", weight: 700 },
        { name: "Nunito", data: nunito800, style: "normal", weight: 800 },
      ],
    },
  );
}
