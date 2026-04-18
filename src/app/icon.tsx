import { ImageResponse } from "next/og";

import { SteadyLogo } from "@/components/ui/steady-logo";

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
          background: "#f5f1ea",
        }}
      >
        <SteadyLogo className="h-[420px] w-[420px]" />
      </div>
    ),
    size,
  );
}
