import type { TriggerConfig } from "../core/config";
import { usePad } from "../core/gamepad";
import { processTrigger } from "../core/curve";
import { Check, Group, Page, Slider } from "../components/ui";
import { useStore } from "../core/store";

function TriggerPanel({ title, cfg, raw, onChange }: { title: string; cfg: TriggerConfig; raw: number | null; onChange: (p: Partial<TriggerConfig>) => void }) {
  const out = raw === null ? null : processTrigger(raw, cfg);
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
      </div>
      <Group title="Tuning">
        <Slider label="Deadzone" value={cfg.deadzone} min={0} max={0.9} info="How far you pull before anything registers (minimum activation)." onChange={(v) => onChange({ deadzone: v })} />
        <Slider label="Max zone" value={cfg.maxZone} min={0.1} max={1} info="The pull depth that counts as 100% (maximum activation). Lower means a shorter pull for full press." onChange={(v) => onChange({ maxZone: v })} />
        <Check label="Digital" checked={cfg.digital} info="Turns the trigger into an on/off button. It switches on halfway between the deadzone and the max zone." onChange={(v) => onChange({ digital: v })} />
      </Group>
      <div className="meter" aria-label={`${title} activation`}>
        <div className="meter-track">
          <div className="zone dead" style={{ width: `${cfg.deadzone * 100}%` }} />
          <div className="zone cap" style={{ left: `${cfg.maxZone * 100}%` }} />
          {raw !== null && <div className="meter-raw" style={{ width: `${raw * 100}%` }} />}
          {out !== null && <div className="meter-out" style={{ width: `${out * 100}%` }} />}
        </div>
        <div className="meter-legend">
          <span>0</span>
          <span>{raw === null ? "No controller connected" : `raw ${raw.toFixed(2)} → out ${(out ?? 0).toFixed(2)}`}</span>
          <span>1</span>
        </div>
      </div>
    </div>
  );
}

export function Triggers() {
  const { draft, update } = useStore();
  const { pad } = usePad();
  const lt = pad.connected ? pad.buttons[6]?.value ?? 0 : null;
  const rt = pad.connected ? pad.buttons[7]?.value ?? 0 : null;
  return (
    <Page title="Triggers">
      <p className="note">
        These are software thresholds. They change what the app reports, not the trigger's physical travel or resistance. DualSense adaptive-trigger resistance needs the native app and a USB connection, and is not built yet.
      </p>
      <div className="two">
        <TriggerPanel title="Left trigger (L2)" cfg={draft.leftTrigger} raw={lt} onChange={(p) => update((c) => ({ ...c, leftTrigger: { ...c.leftTrigger, ...p } }))} />
        <TriggerPanel title="Right trigger (R2)" cfg={draft.rightTrigger} raw={rt} onChange={(p) => update((c) => ({ ...c, rightTrigger: { ...c.rightTrigger, ...p } }))} />
      </div>
    </Page>
  );
}
