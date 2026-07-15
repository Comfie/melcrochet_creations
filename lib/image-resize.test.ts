import { describe, it, expect } from "vitest";
import { computeResizedDimensions } from "./image-resize";

describe("computeResizedDimensions", () => {
  it("leaves an image unscaled when both dimensions are under the max", () => {
    expect(computeResizedDimensions(1200, 800, 2000)).toEqual({
      width: 1200,
      height: 800,
      scale: 1,
    });
  });

  it("scales down a landscape image so the longest side hits the max", () => {
    expect(computeResizedDimensions(4000, 3000, 2000)).toEqual({
      width: 2000,
      height: 1500,
      scale: 0.5,
    });
  });

  it("scales down a portrait image so the longest side hits the max", () => {
    expect(computeResizedDimensions(3000, 4000, 2000)).toEqual({
      width: 1500,
      height: 2000,
      scale: 0.5,
    });
  });

  it("treats an image exactly at the max dimension as unscaled", () => {
    expect(computeResizedDimensions(2000, 1000, 2000)).toEqual({
      width: 2000,
      height: 1000,
      scale: 1,
    });
  });
});
