// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGallery } from "./ProductGallery";

beforeAll(() => {
  // jsdom doesn't implement <dialog>'s imperative API.
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

afterEach(() => {
  cleanup();
});

const images = [
  { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", alt: "Lap Throw Blanket" },
  { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", alt: "Lap Throw Blanket photo 2" },
];

describe("ProductGallery", () => {
  it("renders a branded placeholder when there are no images", () => {
    render(<ProductGallery images={[]} />);
    expect(screen.getByRole("img", { name: /photo coming soon/i })).toBeInTheDocument();
  });

  it("does not render a thumbnail strip for a single image", () => {
    render(<ProductGallery images={[images[0]]} />);
    expect(screen.queryByLabelText("More photos")).not.toBeInTheDocument();
  });

  it("swaps the main image when a thumbnail is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={images} />);

    const beforeButton = screen.getByRole("button", { name: /view larger photo of lap throw blanket$/i });
    expect(beforeButton).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show photo 2 of 2/i }));

    expect(
      screen.getByRole("button", { name: /view larger photo of lap throw blanket photo 2/i })
    ).toBeInTheDocument();
  });

  it("opens the lightbox dialog when the main image is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={images} />);

    await user.click(screen.getByRole("button", { name: /view larger photo of lap throw blanket$/i }));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });
});
