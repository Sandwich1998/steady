import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 28% 20%, rgba(55,245,220,0.42) 0%, transparent 30%), radial-gradient(circle at 72% 22%, rgba(255,47,104,0.58) 0%, transparent 34%), linear-gradient(145deg, #121417 0%, #08090a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 54,
            border: "4px solid rgba(255,255,255,0.18)",
            borderRadius: 120,
            boxShadow: "0 40px 120px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 218,
            height: 218,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 72,
            color: "#08090a",
            background: "linear-gradient(135deg, #37f5dc 0%, #f6d365 45%, #ff2f68 100%)",
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: -12,
          }}
        >
          S
        </div>
      </div>
    ),
    size,
  );
}
