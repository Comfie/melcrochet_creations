// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
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

  it("asks before discarding unsaved changes", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <SlideOver open={true} onClose={onClose} title="Test" dirty>
        <p>Content</p>
      </SlideOver>
    );
    await user.click(screen.getByLabelText("Close panel"));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Discard changes?");

    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText("Close panel"));
    await user.click(screen.getByRole("button", { name: "Discard" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on the phone's back button instead of leaving the page", () => {
    const onClose = vi.fn();
    render(
      <SlideOver open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </SlideOver>
    );
    expect(window.history.state).toMatchObject({ mcSheet: true });
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders a pinned footer", () => {
    render(
      <SlideOver open={true} onClose={vi.fn()} title="Test" footer={<button>Save</button>}>
        <p>Content</p>
      </SlideOver>
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
