// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import Toast from "./Toast";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Toast", () => {
  it("renders the message", () => {
    render(<Toast message="Product saved" type="success" onDismiss={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Product saved");
  });

  it("calls onDismiss after 3 seconds", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast message="Done" type="success" onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
