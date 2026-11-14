import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SNAP } from "./theme";

type Props = {
  text: string;
  /** Frames between each word's entrance. */
  stagger?: number;
  delay?: number;
  style?: React.CSSProperties;
  /** Travel distance of the mask reveal, in px. */
  rise?: number;
};

/**
 * Word-by-word mask reveal: each word slides up out of a clipped box, staggered.
 * Newlines in `text` become line breaks.
 */
export const Words: React.FC<Props> = ({ text, stagger = 2, delay = 0, style, rise = 70 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let i = 0;

  return (
    <span style={{ display: "block", ...style }}>
      {text.split("\n").map((line, l) => (
        <span key={l} style={{ display: "block", overflow: "hidden", paddingBottom: "0.1em" }}>
          {line.split(" ").map((word) => {
            const t = spring({
              frame: frame - delay - i++ * stagger,
              fps,
              config: SNAP,
              durationInFrames: 26,
            });
            return (
              <span
                key={`${word}-${i}`}
                style={{
                  display: "inline-block",
                  whiteSpace: "pre",
                  transform: `translateY(${interpolate(t, [0, 1], [rise, 0])}px)`,
                  opacity: interpolate(t, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                {word}{" "}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
};
