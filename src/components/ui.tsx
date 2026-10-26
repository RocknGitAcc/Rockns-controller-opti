import type { CSSProperties, ReactNode } from "react";

export function Info({ text }: { text: string }) {
  return (
    <span className="info" title={text} aria-label={text}>
      i
    </span>
  );
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  digits?: number;
  disabled?: boolean;
  info?: string;
  onChange: (v: number) => void;
};

export function Slider({ label, value, min, max, step = 0.01, digits = 2, disabled, info, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={"row" + (disabled ? " off" : "")}>
      <span className="lbl">
        {label}
        {info && <Info text={info} />}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ "--p": `${pct}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="val">{value.toFixed(digits)}</span>
    </label>
  );
}

type CheckProps = { label: string; checked: boolean; disabled?: boolean; info?: string; onChange: (v: boolean) => void };

export function Check({ label, checked, disabled, info, onChange }: CheckProps) {
  return (
    <label className={"check" + (disabled ? " off" : "")}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
      {info && <Info text={info} />}
    </label>
  );
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="group">
      <h3 className="eyebrow">{title}</h3>
      {children}
    </section>
  );
}

export function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="page">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
