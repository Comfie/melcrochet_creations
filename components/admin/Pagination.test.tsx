// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

afterEach(() => {
  cleanup();
});

describe("Pagination", () => {
  it("renders nothing when totalPages is 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when totalPages is 0", () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the current page and total pages", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("disables Previous on the first page", () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    render(<Pagination page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("calls onPageChange with page - 1 when Previous is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with page + 1 when Next is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
