// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, cleanup, act } from "@testing-library/react";
import { useApiList } from "./use-api-list";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useApiList", () => {
  it("fetches data on mount and returns it", async () => {
    const items = [{ id: "1", name: "Test" }];
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(items), { status: 200 })
    );

    const { result } = renderHook(() =>
      useApiList<{ id: string; name: string }>("/api/test")
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(items);
    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledWith("/api/test");
  });

  it("sets error on non-OK response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    );

    const { result } = renderHook(() => useApiList("/api/test"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Forbidden");
    expect(result.current.data).toEqual([]);
  });

  it("refreshes in place without going back to the loading state", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "1" }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "1" }, { id: "2" }]), { status: 200 }));

    const { result } = renderHook(() => useApiList<{ id: string }>("/api/test"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let pending: Promise<void> | undefined;
    act(() => {
      pending = result.current.refresh();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toHaveLength(1);

    await act(async () => {
      await pending;
    });
    expect(result.current.data).toHaveLength(2);
  });

  it("refetches when the page becomes visible again", async () => {
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockImplementation(async () => new Response("[]", { status: 200 }));

    renderHook(() => useApiList("/api/test"));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  it("redirects to login on 401", async () => {
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    });
    // Need to make href settable
    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, href: "" },
      writable: true,
    });
    Object.defineProperty(window.location, "href", {
      set: hrefSetter,
      get: () => "",
    });

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );

    renderHook(() => useApiList("/api/test"));

    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith("/admin/login");
    });

    // Restore
    locationSpy.mockRestore();
  });
});
