import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ACCENT, ACCENT_2, INK, INK_2 } from "./theme";

/** Two slow-orbiting colour blobs plus a drifting grid. Never still, never distracting. */
export const Backdrop: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const a = (frame / 240) * Math.PI * 2;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${INK} 0%, ${INK_2} 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "88px 88px",
          backgroundPosition: `${(frame * 0.35) % 88}px ${(-frame * 0.2) % 88}px`,
          maskImage: "radial-gradient(70% 70% at 50% 45%, #000 20%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          left: 1050 + Math.cos(a) * 190,
          top: -260 + Math.sin(a) * 150,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}${intensity > 0.6 ? "55" : "2A"} 0%, transparent 62%)`,
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: -280 + Math.sin(a * 0.8) * 160,
          top: 420 + Math.cos(a * 0.8) * 130,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT_2}${intensity > 0.6 ? "40" : "1E"} 0%, transparent 62%)`,
          filter: "blur(30px)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: interpolate(intensity, [0, 1], [0.5, 0]),
          background: INK,
        }}
      />
    </AbsoluteFill>
  );
};
