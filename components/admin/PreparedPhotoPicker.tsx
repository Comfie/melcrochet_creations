"use client";

import { useId, useState } from "react";
import { Images } from "lucide-react";
import { PREPARED_PHOTOS, type PreparedPhoto } from "@/lib/prepared-photos";
import { cld } from "@/lib/cloudinary-url";
import { inputClass } from "@/components/admin/form";

export default function PreparedPhotoPicker({ onSelect, excludedIds = [], disabled = false, label = "Choose edited photos" }: {
  onSelect: (photo: PreparedPhoto) => void;
  excludedIds?: string[];
  disabled?: boolean;
  label?: string;
}) {
  const [search, setSearch] = useState("");
  const searchId = useId();
  const available = PREPARED_PHOTOS.filter((photo) => !excludedIds.includes(photo.publicId));
  const photos = available.filter((photo) => `${photo.group} ${photo.name} ${photo.view}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <details className="mt-4 rounded-xl border border-brown/20 bg-white p-4">
      <summary className="flex min-h-12 cursor-pointer items-center gap-2 text-sm font-semibold text-ink"><Images size={18} aria-hidden="true" />{label}</summary>
      <p className="mb-4 mt-2 text-sm leading-relaxed text-brown">Use the same edited photos shown on your website. Select a photo, then finish your product’s name, price and description.</p>
      <label htmlFor={searchId} className="mb-2 block text-sm font-semibold">Find an edited photo</label>
      <input id={searchId} type="search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} placeholder="Try dress, cardigan or bikini" className={inputClass} />
      <div className="mt-4 grid max-h-[32rem] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.publicId} className="rounded-lg border border-brown/15 bg-cream p-2">
            <button type="button" disabled={disabled} onClick={() => onSelect(photo)} aria-label={`Use ${photo.group} — ${photo.view}`} className="block min-h-12 w-full text-left disabled:opacity-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cld(photo.url, "portrait")} alt={photo.alt} loading="lazy" className="aspect-[3/4] w-full rounded object-contain" />
              <span className="mt-2 block text-sm font-semibold leading-snug">{photo.group}</span>
              <span className="mt-1 block text-xs text-brown">{photo.view}</span>
            </button>
            <a href={photo.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-gold-deep underline underline-offset-4">Open full-size photo</a>
          </div>
        ))}
      </div>
      {photos.length === 0 && <p className="py-4 text-sm text-brown">No matching photos. Try another name or clear your search.</p>}
    </details>
  );
}
