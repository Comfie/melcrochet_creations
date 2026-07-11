// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SlideOver from "./SlideOver";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SlideOver", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <SlideOver open={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </SlideOver>
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders title and children when open", () => {
    render(
      <SlideOver open={true} onClose={vi.fn()} title="Edit Product">
        <p>Form here</p>
      </SlideOver>
    );
    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(screen.getByText("Form here")).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <SlideOver open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </SlideOver>
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <SlideOver open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </SlideOver>
    );
    await user.click(screen.getByLabelText("Close panel"));
    expect(onClose).toHaveBeenCalled();
  });
});
