"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Star, X } from "lucide-react";
import { cld } from "@/lib/cloudinary-url";
import { uploadImage, ACCEPTED_IMAGE_TYPES } from "@/lib/upload-image";
import type { ProductGalleryImage } from "@/lib/product-gallery";

interface Props {
  value: ProductGalleryImage[];
  onChange: (value: ProductGalleryImage[]) => void;
  max?: number;
  onBusyChange?: (busy: boolean) => void;
  /** Shows a "Make main" action on each photo (product forms). */
  onMakeMain?: (image: ProductGalleryImage) => void;
}

/**
 * Extra product photos. Picks several at once from the phone's library and
 * uploads them one after another, showing a placeholder per pending photo.
 */
export default function GalleryUpload({ value, onChange, max = 6, onBusyChange, onMakeMain }: Props) {
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Uploads finish asynchronously; read the latest gallery (which may have
  // changed meanwhile, e.g. a photo removed) rather than a stale closure.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const remaining = max - value.length - pending;

  function remove(publicId: string) {
    const next = value.filter((img) => img.publicId !== publicId);
    valueRef.current = next;
    onChange(next);
  }

  async function handleFiles(files: File[]) {
    setError(null);
    const accepted = files.slice(0, Math.max(0, remaining));
    const skipped = files.length - accepted.length;
    if (accepted.length === 0) return;

    setPending((n) => n + accepted.length);
    onBusyChange?.(true);
    let failures = 0;
    for (const file of accepted) {
      try {
        const img = await uploadImage(file);
        const next = [...valueRef.current, img];
        valueRef.current = next;
        onChange(next);
      } catch {
        failures += 1;
      } finally {
        setPending((n) => n - 1);
      }
    }
    onBusyChange?.(false);

    const problems = [
      failures > 0 && `${failures} photo${failures > 1 ? "s" : ""} didn’t upload — try again.`,
      skipped > 0 && `Only ${max} extra photos are allowed, so ${skipped} ${skipped > 1 ? "were" : "was"} skipped.`,
    ].filter(Boolean);
    if (problems.length) setError(problems.join(" "));
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.publicId} className="relative aspect-square overflow-hidden rounded-xl bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(img.url, "card")} alt={`Extra photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(img.publicId)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-ink/75 text-cream backdrop-blur hover:bg-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {onMakeMain && (
              <button
                type="button"
                onClick={() => onMakeMain(img)}
                aria-label={`Make photo ${i + 1} the main photo`}
                className="absolute inset-x-1 bottom-1 flex min-h-8 items-center justify-center gap-1 rounded-lg bg-cream/90 text-[0.6875rem] font-bold uppercase tracking-wide text-ink backdrop-blur hover:bg-cream"
              >
                <Star className="h-3 w-3" aria-hidden="true" />
                Make main
              </button>
            )}
          </li>
        ))}

        {Array.from({ length: pending }, (_, i) => (
          <li key={`pending-${i}`} className="flex aspect-square items-center justify-center rounded-xl bg-sand text-brown">
            <LoaderCircle className="h-6 w-6 animate-spin" aria-label="Uploading" />
          </li>
        ))}

        {remaining > 0 && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brown/30 bg-white text-xs font-semibold text-brown transition hover:border-brown/60"
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              Add photos
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          handleFiles(files);
        }}
        className="hidden"
      />

      <p className="mt-2 text-[0.8125rem] text-brown/80">
        {value.length} of {max} · You can select several photos at once.
      </p>
      {error && (
        <p role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
