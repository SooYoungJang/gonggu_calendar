import { describe, expect, it } from "vitest";

import { colors } from "../index";

describe("shared root token exports", () => {
  it("re-exports colors from the root shared package entrypoint", () => {
    expect(colors.primary[500]).toBe("oklch(0.58 0.22 260)");
  });
});
