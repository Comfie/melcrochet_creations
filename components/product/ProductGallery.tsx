"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export interface GalleryImage {
  url: string;
  alt: string;
}

const ARROW =
  "flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cream";

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-[3/4] w-full" />;
  }

  const active = images[activeIndex];
  const many = images.length > 1;
  const go = (delta: number) =>
    setActiveIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div
        className="relative flex-1"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (!many || touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-label={`View larger photo of ${active.alt}`}
          className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-sand"
        >
          <Image
            key={active.url}
            src={cld(active.url, "detail")}
            alt={active.alt}
            fill
            sizes={IMG_SIZES.gallery}
            preload={activeIndex === 0}
            className="animate-fade object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Expand className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </button>

        {many && (
          <>
            <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`pointer-events-auto ${ARROW}`}>
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`pointer-events-auto ${ARROW}`}>
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <p className="label absolute left-4 top-4 bg-cream/90 px-2.5 py-1.5 tabular-nums text-ink" aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
          </>
        )}
      </div>

      {many && (
        <ul
          className="no-scrollbar flex gap-2 overflow-x-auto lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-visible"
          aria-label="More photos"
        >
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-current={i === activeIndex ? "true" : undefined}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                className={`relative block h-20 w-16 overflow-hidden transition-opacity lg:h-[6.5rem] lg:w-20 ${
                  i === activeIndex ? "opacity-100 outline outline-1 outline-offset-2 outline-ink" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={cld(img.url, "thumb")}
                  alt=""
                  fill
                  sizes={IMG_SIZES.thumb}
                  className="object-cover"
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
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 backdrop:bg-ink/80"
      >
        <div className="flex h-full w-full items-center justify-center p-4 sm:p-12">
          <Image
            src={cld(active.url, "detail")}
            alt={active.alt}
            width={1200}
            height={1600}
            sizes="100vw"
            className="max-h-full w-auto object-contain"
          />
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close photo"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream text-ink"
        >
          <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
        {many && (
          <div className="absolute inset-x-4 bottom-6 flex items-center justify-center gap-6">
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={ARROW}>
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <span className="label tabular-nums text-cream">
              {activeIndex + 1} / {images.length}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className={ARROW}>
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
