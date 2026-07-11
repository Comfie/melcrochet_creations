// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useApiMutation } from "./use-api-mutation";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useApiMutation", () => {
  it("sends a POST request and calls onSuccess", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "1" }), { status: 201 })
    );
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useApiMutation());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.mutate("/api/products", {
        method: "POST",
        body: { name: "Test" },
        onSuccess,
      });
    });

    expect(success).toBe(true);
    expect(onSuccess).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });
  });

  it("calls onError with the server error message on failure", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
      })
    );
    const onError = vi.fn();

    const { result } = renderHook(() => useApiMutation());

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.mutate("/api/products", {
        method: "POST",
        body: {},
        onError,
      });
    });

    expect(success).toBe(false);
    expect(onError).toHaveBeenCalledWith("Name is required");
  });
});
