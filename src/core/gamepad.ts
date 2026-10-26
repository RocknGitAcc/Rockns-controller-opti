import { useEffect, useRef, useState } from "react";

export type PadSnapshot = {
  connected: boolean;
  id: string;
  mapping: string;
  axes: number[];
  buttons: { pressed: boolean; value: number }[];
};

export const NO_PAD: PadSnapshot = { connected: false, id: "", mapping: "", axes: [0, 0, 0, 0], buttons: [] };

/** Standard-mapping button names for a DualSense in Chromium. */
export const BUTTON_NAMES = [
  "Cross", "Circle", "Square", "Triangle", "L1", "R1", "L2", "R2",
  "Create", "Options", "L3", "R3", "D-up", "D-down", "D-left", "D-right", "PS", "Touchpad",
];

export function isDualSense(id: string): boolean {
  return /dualsense/i.test(id) || (/054c/i.test(id) && /0ce6|0df2/i.test(id));
}

/**
 * Reads the first connected gamepad every animation frame.
 * ups = how many distinct input reports the browser saw in the last second.
 * This is what the browser exposes, not the controller's true polling rate.
 */
export function usePad(): { pad: PadSnapshot; ups: number | null } {
  const [state, setState] = useState<{ pad: PadSnapshot; ups: number | null }>({ pad: NO_PAD, ups: null });
  const lastStamp = useRef(0);
  const stamps = useRef<number[]>([]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const list = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      const gp = list.find((g): g is Gamepad => !!g && g.connected);
      if (!gp) {
        stamps.current = [];
        setState((s) => (s.pad.connected ? { pad: NO_PAD, ups: null } : s));
      } else {
        const now = performance.now();
        if (gp.timestamp !== lastStamp.current) {
          lastStamp.current = gp.timestamp;
          stamps.current.push(now);
        }
        stamps.current = stamps.current.filter((t) => now - t <= 1000);
        setState({
          pad: {
            connected: true,
            id: gp.id,
            mapping: gp.mapping,
            axes: Array.from(gp.axes),
            buttons: gp.buttons.map((b) => ({ pressed: b.pressed, value: b.value })),
          },
          ups: stamps.current.length,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return state;
}

/** Stick as -1..1 with up positive. side 0 = left, 1 = right. */
export function stickOf(pad: PadSnapshot, side: 0 | 1): [number, number] {
  return [pad.axes[side * 2] ?? 0, -(pad.axes[side * 2 + 1] ?? 0)];
}
