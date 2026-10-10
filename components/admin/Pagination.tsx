"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BTN =
  "inline-flex min-h-11 items-center gap-1 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-brown/15 transition hover:ring-brown/40 disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  function go(next: number) {
    onPageChange(next);
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  return (
    <nav aria-label="Pages" className="mt-5 flex items-center justify-between">
      <button type="button" onClick={() => go(page - 1)} disabled={page <= 1} className={BTN}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>
      <span className="text-sm text-brown/80">
        Page {page} of {totalPages}
      </span>
      <button type="button" onClick={() => go(page + 1)} disabled={page >= totalPages} className={BTN}>
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
