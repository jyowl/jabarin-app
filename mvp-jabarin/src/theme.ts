export const INK = "#08182E";
export const INK_2 = "#0E2A4A";
export const ACCENT = "#17B978";
export const ACCENT_2 = "#2E8BFF";
export const PAPER = "#F6F3EC";

export const FPS = 30;
/** Beat before narration starts, and after it ends. */
export const LEAD = 0.45;
export const TAIL = 0.6;

export const FONT = `"Inter", "Helvetica Neue", -apple-system, system-ui, sans-serif`;

/** Spring with a little overshoot — the GSAP "back.out" feel. */
export const SNAP = { damping: 14, mass: 0.7, stiffness: 110 } as const;
/** Spring that settles without overshoot, for big moves. */
export const GLIDE = { damping: 22, mass: 0.9, stiffness: 90 } as const;
