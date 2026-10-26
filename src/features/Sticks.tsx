import { CURVES, type CurveName, type StickConfig } from "../core/config";
import { stickOf, usePad } from "../core/gamepad";
import { processStick } from "../core/curve";
import { Check, Group, Page, Slider } from "../components/ui";
import { CurveGraph, ShapePreview } from "../components/Graphs";
import { useStore } from "../core/store";

const CURVE_LABEL: Record<CurveName, string> = {
  linear: "Linear",
  smooth: "Smooth (S-curve)",
  aggressive: "Aggressive (fast start)",
  precise: "Precise (slow start)",
};

type PanelProps = {
  title: string;
  cfg: StickConfig;
  live: [number, number] | null;
  onChange: (patch: Partial<StickConfig>) => void;
};

function StickPanel({ title, cfg, live, onChange }: PanelProps) {
  const out = live ? processStick(live[0], live[1], cfg) : null;
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <select value={cfg.curve} onChange={(e) => onChange({ curve: e.target.value as CurveName })} aria-label={`${title} curve`}>
          {CURVES.map((c) => (
            <option key={c} value={c}>
              {CURVE_LABEL[c]}
            </option>
          ))}
        </select>
      </div>

      <Group title="Zones">
        <Slider label="Deadzone" value={cfg.deadzone} min={0} max={0.9} info="Ignores small movements near the center. Raise it if the camera drifts on its own." onChange={(v) => onChange({ deadzone: v })} />
        <Slider label="Anti-deadzone" value={cfg.antiDeadzone} min={0} max={0.9} info="Output jumps straight to this level once you leave the deadzone. Use it for games that have their own built-in deadzone." onChange={(v) => onChange({ antiDeadzone: v })} />
        <Slider label="Max zone" value={cfg.maxZone} min={0.1} max={1} info="How far you push before the output hits 100%. Lower means you reach full speed with less travel." onChange={(v) => onChange({ maxZone: v })} />
      </Group>

      <Group title="Response">
        <Slider label="Gain" value={cfg.gain} min={0.2} max={2} info="Multiplies the output. Above 1.00 reaches full output sooner. Output never exceeds 100%." onChange={(v) => onChange({ gain: v })} />
        <Slider label="Vertical ratio" value={cfg.verticalRatio} min={0.2} max={2} info="Scales up/down movement against left/right. 0.50 makes vertical aim half as fast." onChange={(v) => onChange({ verticalRatio: v })} />
        <Check label="Force circular output" checked={cfg.circular} info="Keeps the output inside a circle so diagonals are not faster than straight lines." onChange={(v) => onChange({ circular: v })} />
        <Check label="Smoothing" checked={cfg.smoothing} info="Blends each new reading with the previous one. Reduces jitter but adds a little delay. Applied in the OBS overlay preview; it only affects games once the native app is running." onChange={(v) => onChange({ smoothing: v })} />
        <Slider label="Smoothing amount" value={cfg.smoothingAmount} min={0} max={0.95} disabled={!cfg.smoothing} onChange={(v) => onChange({ smoothingAmount: v })} />
      </Group>

      <div className="plots">
        <figure>
          <figcaption>
            <span className="eyebrow">Response curve</span>
            <small>input to output</small>
          </figcaption>
          <CurveGraph cfg={cfg} live={live} />
        </figure>
        <figure>
          <figcaption>
            <span className="eyebrow">Output shape</span>
            <small>vertical {cfg.verticalRatio.toFixed(2)} x horizontal 1.00 ({cfg.circular ? "round" : "square-limited"})</small>
          </figcaption>
          <ShapePreview cfg={cfg} live={live} />
        </figure>
      </div>
      <p className="hint">{live && out ? `Live: in ${live[0].toFixed(2)}, ${live[1].toFixed(2)} → out ${out[0].toFixed(2)}, ${out[1].toFixed(2)}` : "Connect a controller (press any button) to see your stick move on these graphs."}</p>
    </div>
  );
}

export function Sticks() {
  const { draft, update } = useStore();
  const { pad } = usePad();
  const left = pad.connected ? stickOf(pad, 0) : null;
  const right = pad.connected ? stickOf(pad, 1) : null;
  return (
    <Page title="Sticks">
      <div className="two">
        <StickPanel title="Left Stick" cfg={draft.leftStick} live={left} onChange={(p) => update((c) => ({ ...c, leftStick: { ...c.leftStick, ...p } }))} />
        <StickPanel title="Right Stick" cfg={draft.rightStick} live={right} onChange={(p) => update((c) => ({ ...c, rightStick: { ...c.rightStick, ...p } }))} />
      </div>
    </Page>
  );
}
