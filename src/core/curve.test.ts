import { describe, expect, it } from "vitest";
import { configSchema, defaultConfig, defaultStick, defaultTrigger, CURVES } from "./config";
import { outlineShape, processMagnitude, processStick, processTrigger } from "./curve";

describe("stick response", () => {
  it("outputs zero inside the deadzone", () => {
    const c = defaultStick();
    expect(processMagnitude(0.1, c)).toBe(0);
    expect(processStick(0.05, 0.05, c)).toEqual([0, 0]);
  });

  it("reaches full output at the max zone", () => {
    expect(processMagnitude(1, defaultStick())).toBeCloseTo(1, 5);
  });

  it("jumps to at least the anti-deadzone just outside the deadzone", () => {
    const c = { ...defaultStick(), antiDeadzone: 0.2 };
    expect(processMagnitude(c.deadzone + 0.001, c)).toBeGreaterThanOrEqual(0.2);
  });

  it("is non-decreasing for every curve preset", () => {
    for (const curve of CURVES) {
      const c = { ...defaultStick(), curve };
      let prev = 0;
      for (let i = 0; i <= 100; i++) {
        const v = processMagnitude(i / 100, c);
        expect(v).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = v;
      }
    }
  });

  it("scales vertical output by the vertical ratio", () => {
    const c = { ...defaultStick(), deadzone: 0, antiDeadzone: 0, verticalRatio: 0.5 };
    const [, y] = processStick(0, 0.8, c);
    expect(y).toBeCloseTo(0.4, 5);
  });

  it("keeps circular output inside the unit circle", () => {
    const c = { ...defaultStick(), verticalRatio: 2, circular: true };
    for (const [x, y] of outlineShape(c)) expect(Math.hypot(x, y)).toBeLessThanOrEqual(1.000001);
  });
});

describe("trigger response", () => {
  it("applies deadzone and max zone", () => {
    const c = { ...defaultTrigger(), deadzone: 0.2, maxZone: 0.8 };
    expect(processTrigger(0.1, c)).toBe(0);
    expect(processTrigger(0.5, c)).toBeCloseTo(0.5, 5);
    expect(processTrigger(0.9, c)).toBe(1);
  });

  it("digital mode is on or off only", () => {
    const c = { ...defaultTrigger(), digital: true };
    expect(processTrigger(0.05, c)).toBe(0);
    expect(processTrigger(1, c)).toBe(1);
  });
});

describe("profile schema", () => {
  it("accepts the default profile", () => {
    expect(configSchema.safeParse(defaultConfig()).success).toBe(true);
  });

  it("rejects out-of-range values and wrong versions", () => {
    const bad = defaultConfig();
    bad.leftStick.deadzone = 5;
    expect(configSchema.safeParse(bad).success).toBe(false);
    expect(configSchema.safeParse({ ...defaultConfig(), version: 2 }).success).toBe(false);
  });
});
