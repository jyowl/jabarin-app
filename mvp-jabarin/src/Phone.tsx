import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { GLIDE, SNAP } from "./theme";

export const PHONE_W = 393;
export const PHONE_H = 873;
const SCALE = 1.08;

type Shot = { img: string; at: number; flip: boolean };

/**
 * One phone for the whole video. It slides between the left and right half as the
 * story moves, and the screen inside scrolls to the next screenshot — so cuts read as
 * one continuous device instead of 24 separate fades.
 */
export const Phone: React.FC<{ shots: Shot[]; enterAt: number; exitAt: number }> = ({
  shots,
  enterAt,
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const index = Math.max(
    0,
    shots.findIndex((s, i) => frame >= s.at && (i === shots.length - 1 || frame < shots[i + 1].at)),
  );
  const current = shots[index];
  const previous = shots[Math.max(0, index - 1)];

  // Eased progress of the move from the previous shot to the current one.
  const move = spring({
    frame: frame - current.at,
    fps,
    config: GLIDE,
    durationInFrames: 30,
  });
  const scroll = index === 0 ? 0 : index - 1 + move;

  const enter = spring({ frame: frame - enterAt, fps, config: SNAP, durationInFrames: 40 });
  const exit = spring({ frame: frame - exitAt, fps, config: GLIDE, durationInFrames: 26 });

  const side = (flip: boolean) => (flip ? -1 : 1);
  const xTarget = side(current.flip) * width * 0.26;
  const xFrom = side(previous.flip) * width * 0.26;
  const x = interpolate(move, [0, 1], [xFrom, xTarget]);

  // Tilt leans into the direction of travel, then settles.
  const lean = interpolate(move, [0, 0.5, 1], [0, (xTarget - xFrom) / 180, 0]);
  // Parked fully below frame before it enters and after it leaves.
  const y = interpolate(enter, [0, 1], [height, 0]) + interpolate(exit, [0, 1], [0, height]);
  const scale = interpolate(enter, [0, 1], [0.8, SCALE]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: PHONE_W,
        height: PHONE_H,
        marginLeft: -PHONE_W / 2,
        marginTop: -PHONE_H / 2,
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${lean}deg) rotateY(${lean * 2}deg)`,
        borderRadius: 46,
        overflow: "hidden",
        background: "#000",
        boxShadow: `0 60px 110px -34px rgba(0,0,0,0.65), 0 0 0 10px #10233c, 0 0 0 11px rgba(255,255,255,0.14)`,
      }}
    >
      {shots.map((s, i) => (
        <Img
          key={s.img + i}
          src={staticFile(s.img)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            transform: `translateY(${(i - scroll) * 100}%)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.22) 50%, transparent 62%)`,
          transform: `translateX(${interpolate(move, [0, 1], [-110, 110])}%)`,
        }}
      />
    </div>
  );
};
