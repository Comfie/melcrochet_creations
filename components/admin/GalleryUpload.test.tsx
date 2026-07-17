// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GalleryUpload from "./GalleryUpload";

afterEach(() => {
  cleanup();
});

describe("GalleryUpload", () => {
  it("shows an 'Add photo' control when under the max", () => {
    render(<GalleryUpload value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add photo/i })).toBeInTheDocument();
  });

  it("renders one thumbnail per existing gallery image with a remove button", () => {
    render(
      <GalleryUpload
        value={[
          { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" },
          { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "products/b" },
        ]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getAllByRole("button", { name: /remove photo/i })).toHaveLength(2);
  });

  it("calls onChange with the image removed when its remove button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <GalleryUpload
        value={[
          { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" },
          { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "products/b" },
        ]}
        onChange={onChange}
      />
    );
    await user.click(screen.getAllByRole("button", { name: /remove photo/i })[0]);
    expect(onChange).toHaveBeenCalledWith([
      { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "products/b" },
    ]);
  });

  it("hides 'Add photo' once the max is reached", () => {
    render(
      <GalleryUpload
        value={[{ url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" }]}
        onChange={vi.fn()}
        max={1}
      />
    );
    expect(screen.queryByRole("button", { name: /add photo/i })).not.toBeInTheDocument();
  });
});
