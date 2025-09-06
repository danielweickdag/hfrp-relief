import { defineConfig } from "vitest/config";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
});

describe("smoke test", () => {
  it("works", () => {
    expect(1 + 1).toBe(2);
  });
});
