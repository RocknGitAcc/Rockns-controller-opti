import { useEffect, useRef } from "react";
import { stickOf, usePad, type PadSnapshot } from "../core/gamepad";
import { processStick, processTrigger, StickSmoother } from "../core/curve";
import { useStore } from "../core/store";

/**
 * Standalone overlay for OBS. Transparent background, no menus.
 * URL options (after the #/overlay): mode=raw|processed, scale=1
 */
export function Overlay({ query }: { query: URLSearchParams }) {
  const { pad } = usePad();
  const { draft } = useStore();
  const processed = query.get("mode") === "processed";
  const scale = Math.min(3, Math.max(0.3, Number(query.get("scale")) || 1));
  const smoothL = useRef(new StickSmoother());
  const smoothR = useRef(new StickSmoother());

  useEffect(() => {
    document.body.classList.add("overlay-body");
    return () => document.body.classList.remove("overlay-body");
  }, []);

  const btn = (i: number) => !!pad.buttons[i]?.pressed;
  const rawL = pad.connected ? stickOf(pad, 0) : ([0, 0] as [number, number]);
  const rawR = pad.connected ? stickOf(pad, 1) : ([0, 0] as [number, number]);

  let L = rawL;
  let R = rawR;
  let lt = pad.buttons[6]?.value ?? 0;
  let rt = pad.buttons[7]?.value ?? 0;
  if (processed) {
    const a = processStick(rawL[0], rawL[1], draft.leftStick);
    const b = processStick(rawR[0], rawR[1], draft.rightStick);
    L = draft.leftStick.smoothing ? smoothL.current.step(a[0], a[1], draft.leftStick.smoothingAmount) : a;
    R = draft.rightStick.smoothing ? smoothR.current.step(b[0], b[1], draft.rightStick.smoothingAmount) : b;
    lt = processTrigger(lt, draft.leftTrigger);
    rt = processTrigger(rt, draft.rightTrigger);
  }

  return (
    <div className="overlay" style={{ width: 520 * scale, height: 270 * scale }}>
      <svg viewBox="0 0 520 270" width="100%" height="100%" role="img" aria-label="Controller overlay">
        <Bar x={40} y={8} fill={lt} label="L2" />
        <Bar x={370} y={8} fill={rt} label="R2" />
        <Key x={40} y={30} w={110} h={14} on={btn(4)} label="L1" />
        <Key x={370} y={30} w={110} h={14} on={btn(5)} label="R1" />

        <Key x={86} y={67} w={18} h={24} on={btn(12)} />
        <Key x={86} y={109} w={18} h={24} on={btn(13)} />
        <Key x={62} y={91} w={24} h={18} on={btn(14)} />
        <Key x={104} y={91} w={24} h={18} on={btn(15)} />

        <Face cx={425} cy={72} on={btn(3)} label="△" />
        <Face cx={453} cy={100} on={btn(1)} label="○" />
        <Face cx={425} cy={128} on={btn(0)} label="✕" />
        <Face cx={397} cy={100} on={btn(2)} label="□" />

        <Key x={205} y={60} w={110} h={60} on={btn(17)} rx={8} />
        <Key x={176} y={72} w={10} h={18} on={btn(8)} />
        <Key x={334} y={72} w={10} h={18} on={btn(9)} />
        <Face cx={260} cy={150} r={9} on={btn(16)} />

        <StickDial cx={200} cy={205} x={L[0]} y={L[1]} click={btn(10)} />
        <StickDial cx={320} cy={205} x={R[0]} y={R[1]} click={btn(11)} />
      </svg>
      {!pad.connected && <div className="overlay-msg">No controller detected - press a button on it</div>}
    </div>
  );
}

function Bar({ x, y, fill, label }: { x: number; y: number; fill: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={110} height={14} className="o-off" />
      <rect x={x} y={y} width={110 * Math.min(1, Math.max(0, fill))} height={14} className="o-on" />
      <text x={x + 55} y={y + 11} className="o-text">{label}</text>
    </g>
  );
}

function Key({ x, y, w, h, on, rx = 3, label }: { x: number; y: number; w: number; h: number; on: boolean; rx?: number; label?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} className={on ? "o-on" : "o-off"} />
      {label && <text x={x + w / 2} y={y + h - 3} className="o-text">{label}</text>}
    </g>
  );
}

function Face({ cx, cy, on, label, r = 13 }: { cx: number; cy: number; on: boolean; label?: string; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className={on ? "o-on" : "o-off"} />
      {label && <text x={cx} y={cy + 5} className="o-text">{label}</text>}
    </g>
  );
}

function StickDial({ cx, cy, x, y, click }: { cx: number; cy: number; x: number; y: number; click: boolean }) {
  const R = 42;
  return (
    <g>
      <circle cx={cx} cy={cy} r={R} className={click ? "o-ring on" : "o-ring"} />
      <circle cx={cx + x * (R - 10)} cy={cy - y * (R - 10)} r={10} className="o-dot" />
    </g>
  );
}

export type { PadSnapshot };
