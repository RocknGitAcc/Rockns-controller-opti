import type { CurveName, StickConfig, TriggerConfig } from "./config";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Shapes a 0..1 value. Linear passes through; others bend the response. */
export function shape(curve: CurveName, t: number): number {
  switch (curve) {
    case "smooth":
      return t * t * (3 - 2 * t);
    case "aggressive":
      return Math.pow(t, 0.6);
    case "precise":
      return Math.pow(t, 1.8);
    default:
      return t;
  }
}

/** Input stick distance from center (0..1) -> output distance (0..1). */
export function processMagnitude(m: number, c: StickConfig): number {
  if (m <= c.deadzone) return 0;
  const span = Math.max(1e-6, c.maxZone - c.deadzone);
  const t = clamp((m - c.deadzone) / span);
  const out = c.antiDeadzone + shape(c.curve, t) * (1 - c.antiDeadzone);
  return clamp(out * c.gain);
}

/** Full stick processing. x and y are -1..1 with "up" positive. */
export function processStick(x: number, y: number, c: StickConfig): [number, number] {
  const m = Math.hypot(x, y);
  if (m === 0) return [0, 0];
  const out = processMagnitude(Math.min(1, m), c);
  let ox = (x / m) * out;
  let oy = (y / m) * out * c.verticalRatio;
  if (c.circular) {
    const len = Math.hypot(ox, oy);
    if (len > 1) {
      ox /= len;
      oy /= len;
    }
  } else {
    ox = clamp(ox, -1, 1);
    oy = clamp(oy, -1, 1);
  }
  return [ox, oy];
}

/** Trigger value 0..1 -> processed 0..1. Digital means fully on/off. */
export function processTrigger(v: number, c: TriggerConfig): number {
  if (v <= c.deadzone) return 0;
  const span = Math.max(1e-6, c.maxZone - c.deadzone);
  const t = clamp((v - c.deadzone) / span);
  return c.digital ? (t >= 0.5 ? 1 : 0) : t;
}

/** Simple low-pass smoother. amount 0 = no smoothing, closer to 1 = heavier. */
export class StickSmoother {
  x = 0;
  y = 0;
  step(x: number, y: number, amount: number): [number, number] {
    const a = 1 - clamp(amount, 0, 0.95);
    this.x += (x - this.x) * a;
    this.y += (y - this.y) * a;
    return [this.x, this.y];
  }
}

/** Outline of everything the stick can output, for the shape preview. */
export function outlineShape(c: StickConfig, n = 72): [number, number][] {
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const a = (2 * Math.PI * k) / n;
    pts.push(processStick(Math.cos(a), Math.sin(a), c));
  }
  return pts;
}
