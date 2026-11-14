import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { Phone } from "./Phone";
import { Scene, scenes } from "./script";
import { ACCENT, FONT, FPS, GLIDE, LEAD, PAPER, SNAP, TAIL } from "./theme";
import { voDurations } from "./vo";
import { Words } from "./Words";

const sceneFrames = (s: Scene) => Math.round((LEAD + voDurations[s.id] + TAIL) * FPS);

const timeline = scenes.reduce<{ scene: Scene; from: number; frames: number }[]>((acc, scene) => {
  const prev = acc[acc.length - 1];
  acc.push({ scene, from: prev ? prev.from + prev.frames : 0, frames: sceneFrames(scene) });
  return acc;
}, []);

const last = timeline[timeline.length - 1];
const TOTAL = last.from + last.frames;
const at = (id: string) => timeline.find((t) => t.scene.id === id)!;
/** Hook (complaints) ends where the product story begins. */
const HOOK_FRAMES = at("05").from;
const OUTRO = at("29");

/** Every screenshot scene, in order, with the frame the phone should land on it. */
const shots = timeline
  .filter((t) => t.scene.img)
  .map((t) => ({ img: t.scene.img as string, at: t.from, flip: Boolean(t.scene.flip) }));

/** Hook card: big pull-quote, counter-moving kicker, accent bar that wipes open. */
const Quote: React.FC<{ scene: Scene; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame, fps, config: GLIDE, durationInFrames: 24 });
  const out = spring({ frame: frame - (frames - 14), fps, config: GLIDE, durationInFrames: 16 });
  const push = interpolate(out, [0, 1], [0, -90]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 170px" }}>
      <div style={{ transform: `translateY(${push}px)`, opacity: 1 - out }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 38 }}>
          <div
            style={{
              height: 5,
              width: interpolate(bar, [0, 1], [0, 92]),
              background: ACCENT,
              borderRadius: 3,
            }}
          />
          <Words
            text={scene.kicker}
            delay={4}
            stagger={1.5}
            rise={34}
            style={{
              fontFamily: FONT,
              fontSize: 27,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 700,
            }}
          />
        </div>
        <Words
          text={scene.title}
          delay={6}
          stagger={2.4}
          style={{
            fontFamily: FONT,
            fontSize: 78,
            lineHeight: 1.26,
            fontWeight: 600,
            color: PAPER,
            letterSpacing: -1,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Copy block beside the phone. Slides in from the opposite side of the device. */
const Copy: React.FC<{ scene: Scene; frames: number }> = ({ scene, frames }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const enter = spring({ frame, fps, config: SNAP, durationInFrames: 30 });
  const out = spring({ frame: frame - (frames - 13), fps, config: GLIDE, durationInFrames: 15 });
  const dir = scene.flip ? 1 : -1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: "0 120px",
        alignItems: scene.flip ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          width: width * 0.4,
          textAlign: scene.flip ? "right" : "left",
          transform: `translateX(${interpolate(enter, [0, 1], [dir * -70, 0]) + out * dir * -60}px)`,
          opacity: 1 - out,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 26,
            flexDirection: scene.flip ? "row-reverse" : "row",
          }}
        >
          <div
            style={{
              height: 4,
              width: interpolate(enter, [0, 1], [0, 58]),
              background: ACCENT,
              borderRadius: 2,
            }}
          />
          <Words
            text={scene.kicker}
            delay={3}
            stagger={1.2}
            rise={30}
            style={{
              fontFamily: FONT,
              fontSize: 23,
              letterSpacing: 3.6,
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 700,
            }}
          />
        </div>
        <Words
          text={scene.title}
          delay={5}
          stagger={2.2}
          rise={60}
          style={{
            fontFamily: FONT,
            fontSize: 62,
            lineHeight: 1.2,
            fontWeight: 600,
            color: PAPER,
            letterSpacing: -0.8,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Final card: wordmark scales in, rule draws across, line resolves. */
const Outro: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mark = spring({ frame, fps, config: SNAP, durationInFrames: 34 });
  const rule = spring({ frame: frame - 16, fps, config: GLIDE, durationInFrames: 30 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 128,
          fontWeight: 800,
          color: PAPER,
          letterSpacing: -4,
          transform: `scale(${interpolate(mark, [0, 1], [0.84, 1])})`,
          opacity: mark,
        }}
      >
        Jabar<span style={{ color: ACCENT }}>in</span>
      </div>
      <div
        style={{
          height: 4,
          width: interpolate(rule, [0, 1], [0, 520]),
          background: ACCENT,
          borderRadius: 2,
          margin: "40px 0 44px",
        }}
      />
      <Words
        text={scene.title}
        delay={30}
        stagger={2.6}
        style={{
          fontFamily: FONT,
          fontSize: 54,
          lineHeight: 1.34,
          fontWeight: 500,
          color: "rgba(246,243,236,0.86)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Looping music bed, faded at both ends so the bed change is inaudible. */
const Bed: React.FC<{ file: string; frames: number; gain: number }> = ({ file, frames, gain }) => {
  const fade = Math.round(1.4 * FPS);
  return (
    <Audio
      src={staticFile(file)}
      loop
      volume={(f) =>
        gain *
        interpolate(f, [0, fade, frames - fade, frames], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  );
};

export const Jabarin: React.FC = () => {
  const frame = useCurrentFrame();
  // Backdrop stays muted during the complaints, brightens when Jabarin arrives.
  const intensity = interpolate(frame, [HOOK_FRAMES - 20, HOOK_FRAMES + 20], [0.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Backdrop intensity={intensity} />

      <Phone shots={shots} enterAt={HOOK_FRAMES} exitAt={OUTRO.from - 14} />

      {timeline.map(({ scene, from, frames }) => (
        <Sequence
          key={scene.id}
          from={from}
          durationInFrames={frames}
          name={`${scene.id} ${scene.kicker}`}
          layout="none"
        >
          {scene.id === OUTRO.scene.id ? (
            <Outro scene={scene} />
          ) : scene.img ? (
            <Copy scene={scene} frames={frames} />
          ) : (
            <Quote scene={scene} frames={frames} />
          )}
          <Sequence from={Math.round(LEAD * FPS)} layout="none">
            <Audio src={staticFile(`vo/${scene.id}.mp3`)} />
          </Sequence>
        </Sequence>
      ))}

      <Sequence durationInFrames={HOOK_FRAMES} layout="none" name="music · hook">
        <Bed file="music/hook.m4a" frames={HOOK_FRAMES} gain={0.3} />
      </Sequence>
      <Sequence
        from={HOOK_FRAMES}
        durationInFrames={TOTAL - HOOK_FRAMES}
        layout="none"
        name="music · main"
      >
        <Bed file="music/main.m4a" frames={TOTAL - HOOK_FRAMES} gain={0.17} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const JabarinComposition = () => (
  <Composition
    id="Jabarin"
    component={Jabarin}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
