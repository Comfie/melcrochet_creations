// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GalleryUpload from "./GalleryUpload";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
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

  it("offers Make main when a handler is given", async () => {
    const user = userEvent.setup();
    const onMakeMain = vi.fn();
    const img = { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" };
    render(<GalleryUpload value={[img]} onChange={vi.fn()} onMakeMain={onMakeMain} />);
    await user.click(screen.getByRole("button", { name: /make photo 1 the main photo/i }));
    expect(onMakeMain).toHaveBeenCalledWith(img);
  });

  it("uploads several selected photos and appends each one", async () => {
    let n = 0;
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      n += 1;
      return new Response(
        JSON.stringify({ url: `https://res.cloudinary.com/demo/image/upload/v1/new${n}.jpg`, publicId: `new${n}` }),
        { status: 200 }
      );
    });
    const onChange = vi.fn();
    const onBusyChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<GalleryUpload value={[]} onChange={onChange} onBusyChange={onBusyChange} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ]);

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    expect(onChange).toHaveBeenLastCalledWith([
      { url: "https://res.cloudinary.com/demo/image/upload/v1/new1.jpg", publicId: "new1" },
      { url: "https://res.cloudinary.com/demo/image/upload/v1/new2.jpg", publicId: "new2" },
    ]);
    expect(onBusyChange).toHaveBeenNthCalledWith(1, true);
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });

  it("skips photos beyond the limit and says so", async () => {
    vi.spyOn(global, "fetch").mockImplementation(
      async () => new Response(JSON.stringify({ url: "https://res.cloudinary.com/demo/image/upload/v1/x.jpg", publicId: "x" }), { status: 200 })
    );
    const user = userEvent.setup();
    const { container } = render(<GalleryUpload value={[]} onChange={vi.fn()} max={1} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ]);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/1 was skipped/));
  });
});
