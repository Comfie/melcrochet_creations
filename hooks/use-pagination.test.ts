// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { usePagination } from "./use-pagination";

afterEach(() => {
  cleanup();
});

describe("usePagination", () => {
  it("returns the first page of items by default", () => {
    const items = Array.from({ length: 45 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(items, 20));

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageItems).toEqual(items.slice(0, 20));
  });

  it("returns the requested page after setPage", () => {
    const items = Array.from({ length: 45 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(items, 20));

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
    expect(result.current.pageItems).toEqual(items.slice(20, 40));
  });

  it("clamps setPage to totalPages", () => {
    const items = Array.from({ length: 45 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(items, 20));

    act(() => {
      result.current.setPage(99);
    });

    expect(result.current.page).toBe(3);
    expect(result.current.pageItems).toEqual(items.slice(40, 45));
  });

  it("clamps the current page when the list shrinks below it", () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: number[] }) => usePagination(items, 20),
      { initialProps: { items: Array.from({ length: 45 }, (_, i) => i) } }
    );

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    rerender({ items: Array.from({ length: 5 }, (_, i) => i) });

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageItems).toEqual([0, 1, 2, 3, 4]);
  });

  it("treats an empty list as a single empty page", () => {
    const { result } = renderHook(() => usePagination([], 20));

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageItems).toEqual([]);
  });

  it("resetPage returns to page 1", () => {
    const items = Array.from({ length: 45 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(items, 20));

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.resetPage();
    });
    expect(result.current.page).toBe(1);
  });

  it("defaults pageSize to 20 when omitted", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const { result } = renderHook(() => usePagination(items));

    expect(result.current.totalPages).toBe(2);
    expect(result.current.pageItems).toHaveLength(20);
  });
});
