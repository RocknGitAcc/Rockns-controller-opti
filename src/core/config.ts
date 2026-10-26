import { z } from "zod";

export const CURVES = ["linear", "smooth", "aggressive", "precise"] as const;
export type CurveName = (typeof CURVES)[number];

export const stickSchema = z.object({
  curve: z.enum(CURVES),
  deadzone: z.number().min(0).max(0.9),
  antiDeadzone: z.number().min(0).max(0.9),
  maxZone: z.number().min(0.1).max(1),
  gain: z.number().min(0.2).max(2),
  verticalRatio: z.number().min(0.2).max(2),
  circular: z.boolean(),
  smoothing: z.boolean(),
  smoothingAmount: z.number().min(0).max(0.95),
});
export type StickConfig = z.infer<typeof stickSchema>;

export const triggerSchema = z.object({
  deadzone: z.number().min(0).max(0.9),
  maxZone: z.number().min(0.1).max(1),
  digital: z.boolean(),
});
export type TriggerConfig = z.infer<typeof triggerSchema>;

export const configSchema = z.object({
  version: z.literal(1),
  name: z.string().min(1).max(60),
  leftStick: stickSchema,
  rightStick: stickSchema,
  leftTrigger: triggerSchema,
  rightTrigger: triggerSchema,
});
export type Config = z.infer<typeof configSchema>;

export const defaultStick = (): StickConfig => ({
  curve: "linear",
  deadzone: 0.15,
  antiDeadzone: 0.05,
  maxZone: 1,
  gain: 1,
  verticalRatio: 1,
  circular: false,
  smoothing: false,
  smoothingAmount: 0,
});

export const defaultTrigger = (): TriggerConfig => ({
  deadzone: 0.1,
  maxZone: 1,
  digital: false,
});

export const defaultConfig = (name = "Default"): Config => ({
  version: 1,
  name,
  leftStick: defaultStick(),
  rightStick: defaultStick(),
  leftTrigger: defaultTrigger(),
  rightTrigger: defaultTrigger(),
});

export type Profile = { id: string; config: Config };
