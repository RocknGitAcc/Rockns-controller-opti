import type { StickConfig } from "../core/config";
import { outlineShape, processMagnitude, processStick } from "../core/curve";

type Live = [number, number] | null;

/** Input distance (left to right) against output distance (bottom to top). */
export function CurveGraph({ cfg, live }: { cfg: StickConfig; live: Live }) {
  const X = (m: number) => 5 + m * 90;
  const Y = (v: number) => 95 - v * 90;
  const pts = Array.from({ length: 101 }, (_, i) => `${X(i / 100)},${Y(processMagnitude(i / 100, cfg))}`).join(" ");
  const m = live ? Math.min(1, Math.hypot(live[0], live[1])) : null;
  return (
    <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="Response curve">
      {[0.25, 0.5, 0.75].map((g) => (
        <g key={g} className="grid">
          <line x1={X(g)} y1={5} x2={X(g)} y2={95} />
          <line x1={5} y1={Y(g)} x2={95} y2={Y(g)} />
        </g>
      ))}
      <line className="ref" x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} />
      <polyline className="trace" points={pts} fill="none" />
      {m !== null && <circle className="dot" cx={X(m)} cy={Y(processMagnitude(m, cfg))} r={2.6} />}
    </svg>
  );
}

/** Everything the stick can output at full push, plus the live position. */
export function ShapePreview({ cfg, live }: { cfg: StickConfig; live: Live }) {
  const C = (v: number) => 50 + v * 42;
  const pts = outlineShape(cfg)
    .map(([x, y]) => `${C(x)},${C(-y)}`)
    .join(" ");
  const out = live ? processStick(live[0], live[1], cfg) : null;
  return (
    <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="Output shape">
      <g className="grid">
        <line x1={50} y1={4} x2={50} y2={96} />
        <line x1={4} y1={50} x2={96} y2={50} />
      </g>
      <polygon className="shape" points={pts} />
      {live && <circle className="ghost" cx={C(live[0])} cy={C(-live[1])} r={2} />}
      {out && <circle className="dot" cx={C(out[0])} cy={C(-out[1])} r={2.6} />}
    </svg>
  );
}
