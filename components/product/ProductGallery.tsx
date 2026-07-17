"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export interface GalleryImage {
  url: string;
  alt: string;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-square w-full" />;
  }

  const active = images[activeIndex];

  return (
    <div>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`View larger photo of ${active.alt}`}
        className="block w-full"
      >
        <Image
          src={cld(active.url, "detail")}
          alt={active.alt}
          width={1200}
          height={1200}
          sizes={IMG_SIZES.detail}
          priority
          className="aspect-square w-full rounded-lg object-cover"
        />
      </button>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2" aria-label="More photos">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-current={i === activeIndex ? "true" : undefined}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                className={`block h-16 w-16 overflow-hidden rounded border transition-colors ${
                  i === activeIndex ? "border-ink" : "border-taupe/30 hover:border-ink"
                }`}
              >
                <Image
                  src={cld(img.url, "thumb")}
                  alt=""
                  width={150}
                  height={150}
                  sizes={IMG_SIZES.thumb}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${active.alt} — full size photo`}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="max-h-[90vh] max-w-[90vw] rounded-lg bg-transparent p-0 backdrop:bg-ink/80"
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close photo"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink shadow"
        >
          &times;
        </button>
        <Image
          src={cld(active.url, "detail")}
          alt={active.alt}
          width={1200}
          height={1200}
          className="max-h-[90vh] w-auto rounded-lg object-contain"
        />
      </dialog>
    </div>
  );
}
