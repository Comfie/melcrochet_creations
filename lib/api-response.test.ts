import { describe, it, expect } from "vitest";
import { z } from "zod";
import { jsonError, jsonValidationError } from "./api-response";

describe("jsonError", () => {
  it("returns the given status and error message", async () => {
    const res = jsonError("Not found", 404);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "Not found" });
  });
});

describe("jsonValidationError", () => {
  it("returns 400 with the zod issues attached", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const result = schema.safeParse({ name: "" });
    if (result.success) throw new Error("expected parse to fail");

    const res = jsonValidationError(result.error.issues);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    expect(Array.isArray(body.details)).toBe(true);
    expect(body.details.length).toBeGreaterThan(0);
  });
});
