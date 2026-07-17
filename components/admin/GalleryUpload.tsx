"use client";

import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { ProductGalleryImage } from "@/lib/product-gallery";

interface Props {
  value: ProductGalleryImage[];
  onChange: (value: ProductGalleryImage[]) => void;
  max?: number;
}

export default function GalleryUpload({ value, onChange, max = 6 }: Props) {
  const [adding, setAdding] = useState(false);

  function remove(publicId: string) {
    onChange(value.filter((img) => img.publicId !== publicId));
  }

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">
        Natural light, plain neutral background. Add at least 3 photos: the
        full item, a close-up of the stitch, and the item in use. Up to {max} photos.
      </p>

      {value.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {value.map((img) => (
            <li key={img.publicId} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-16 w-16 rounded object-cover" />
              <button
                type="button"
                onClick={() => remove(img.publicId)}
                aria-label="Remove photo"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < max &&
        (adding ? (
          <ImageUpload
            onUploaded={(url, publicId) => {
              onChange([...value, { url, publicId }]);
              setAdding(false);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-gray-400"
          >
            + Add photo
          </button>
        ))}
    </div>
  );
}
