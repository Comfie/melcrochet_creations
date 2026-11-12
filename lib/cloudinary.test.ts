import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("cloudinary", () => ({ v2: { uploader: { destroy: vi.fn().mockResolvedValue({ result: "ok" }) } } }));
import cloudinary, { deleteImage } from "./cloudinary";
import { PREPARED_PHOTOS } from "./prepared-photos";
afterEach(() => vi.clearAllMocks());

describe("shared prepared-image protection", () => {
  it("preserves every shared website photo when removed from a product", async () => {
    for (const photo of PREPARED_PHOTOS) await deleteImage(photo.publicId);
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });
  it("still removes ordinary orphaned uploads", async () => {
    await deleteImage("melcrochet/temporary-upload");
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("melcrochet/temporary-upload");
  });
});
