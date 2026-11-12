// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PreparedPhotoPicker from "./PreparedPhotoPicker";
import ImageUpload from "./ImageUpload";
import GalleryUpload from "./GalleryUpload";
import { PREPARED_PHOTOS } from "@/lib/prepared-photos";

afterEach(cleanup);

describe("prepared product photos", () => {
  it("filters by design and exposes full-size originals of the selected edits", async () => {
    const user = userEvent.setup();
    render(<PreparedPhotoPicker onSelect={vi.fn()} />);
    await user.click(screen.getByText("Choose edited photos"));
    await user.type(screen.getByLabelText("Find an edited photo"), "Orange and cream dress");
    expect(screen.getAllByRole("button", { name: /^Use / })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Open full-size photo" })).toHaveAttribute("href", PREPARED_PHOTOS.find((p) => p.group === "Orange and cream dress")!.url);
  });

  it("marks a main-image library choice separately from a new upload", async () => {
    const user = userEvent.setup();
    const onUploaded = vi.fn();
    render(<ImageUpload allowPrepared onUploaded={onUploaded} />);
    await user.click(screen.getByText("Choose edited photos"));
    const photo = PREPARED_PHOTOS[0];
    await user.click(screen.getByRole("button", { name: `Use ${photo.group} — ${photo.view}` }));
    expect(onUploaded).toHaveBeenCalledWith(photo.url, photo.publicId, "library");
  });

  it("adds a gallery image without registering it for temporary-upload cleanup", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onUploaded = vi.fn();
    render(<GalleryUpload allowPrepared value={[]} onChange={onChange} onUploaded={onUploaded} />);
    await user.click(screen.getByText("Choose edited gallery photos"));
    const photo = PREPARED_PHOTOS[0];
    await user.click(screen.getByRole("button", { name: `Use ${photo.group} — ${photo.view}` }));
    expect(onChange).toHaveBeenCalledWith([{ url: photo.url, publicId: photo.publicId }]);
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("disables adding prepared images when the gallery is full", async () => {
    const user = userEvent.setup();
    const existing = PREPARED_PHOTOS[0];
    const onChange = vi.fn();
    render(<GalleryUpload allowPrepared max={1} value={[existing]} onChange={onChange} />);
    await user.click(screen.getByText("Choose edited gallery photos"));
    const available = PREPARED_PHOTOS[1];
    expect(screen.getByRole("button", { name: `Use ${available.group} — ${available.view}` })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
