import { defaultConfig, type Config } from "./config";

export type Preset = { id: string; label: string; apply: (c: Config) => Config };

export const PRESETS: Preset[] = [
  { id: "balanced", label: "Balanced (defaults)", apply: (c) => defaultConfig(c.name) },
  {
    id: "aim",
    label: "Shooter: precise aim",
    apply: (c) => ({
      ...c,
      leftStick: { ...c.leftStick, curve: "linear", deadzone: 0.1 },
      rightStick: { ...c.rightStick, curve: "precise", deadzone: 0.08, antiDeadzone: 0.08 },
    }),
  },
  {
    id: "fast",
    label: "Fast turning",
    apply: (c) => ({
      ...c,
      rightStick: { ...c.rightStick, curve: "aggressive", deadzone: 0.1, antiDeadzone: 0.05, gain: 1.2 },
    }),
  },
  {
    id: "racing",
    label: "Racing",
    apply: (c) => ({
      ...c,
      leftStick: { ...c.leftStick, curve: "smooth", deadzone: 0.05, antiDeadzone: 0 },
      leftTrigger: { ...c.leftTrigger, deadzone: 0.03 },
      rightTrigger: { ...c.rightTrigger, deadzone: 0.03 },
    }),
  },
];
