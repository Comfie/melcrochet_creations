"use client";

import { useState, useRef, type DragEvent } from "react";
import { Camera, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { cld } from "@/lib/cloudinary-url";
import { uploadImage, ACCEPTED_IMAGE_TYPES } from "@/lib/upload-image";

interface ImageUploadProps {
  currentUrl?: string | null;
  onUploaded: (url: string, publicId: string) => void;
  /** Lets the form block Save while a photo is still on its way up. */
  onBusyChange?: (busy: boolean) => void;
  /** Shows a Remove button for optional photos. */
  onRemove?: () => void;
  /** Tile shape: portrait for products, wide for blog covers, square for people. */
  shape?: "portrait" | "wide" | "square";
  emptyLabel?: string;
}

const SHAPES = {
  portrait: "aspect-[3/4] w-40",
  wide: "aspect-[16/10] w-full max-w-sm",
  square: "aspect-square w-32",
} as const;

const PREVIEW_PRESET = { portrait: "portrait", wide: "wide", square: "card" } as const;

export default function ImageUpload({
  currentUrl,
  onUploaded,
  onBusyChange,
  onRemove,
  shape = "portrait",
  emptyLabel = "Add photo",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    onBusyChange?.(true);
    try {
      const { url, publicId } = await uploadImage(file);
      setPreview(url);
      onUploaded(url, publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so picking the same photo again still fires onChange.
    e.target.value = "";
    if (file) uploadFile(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <div className="flex items-end gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          aria-label={preview ? "Change photo" : emptyLabel}
          className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition ${SHAPES[shape]} ${
            preview ? "border-transparent bg-sand" : dragOver ? "border-ink bg-sand" : "border-brown/30 bg-white hover:border-brown/60"
          }`}
        >
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cld(preview, PREVIEW_PRESET[shape])} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {uploading ? (
            <span className="relative flex flex-col items-center gap-2 rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-ink">
              <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
              Uploading…
            </span>
          ) : (
            !preview && (
              <span className="flex flex-col items-center gap-2 px-3 text-sm font-semibold text-brown">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                </span>
                {emptyLabel}
              </span>
            )
          )}
        </button>

        {preview && !uploading && (
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-brown/20 hover:ring-brown/50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Change
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  onRemove();
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
