"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Max width from md up; phones always get a full-screen sheet. */
  width?: string;
  /** Pinned action bar (Save / Delete) — stays in thumb reach while the form scrolls. */
  footer?: ReactNode;
  /** When true, closing asks "Discard changes?" instead of silently losing edits. */
  dirty?: boolean;
  children: ReactNode;
}

export default function SlideOver({
  open,
  onClose,
  title,
  width = "md:max-w-lg",
  footer,
  dirty = false,
  children,
}: SlideOverProps) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Latest values for the long-lived listeners below.
  const onCloseRef = useRef(onClose);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    onCloseRef.current = onClose;
    dirtyRef.current = dirty;
  });

  function requestClose() {
    if (dirtyRef.current) setConfirmDiscard(true);
    else onCloseRef.current();
  }

  // Escape closes (via the discard check). ConfirmDialog handles its own
  // Escape in the capture phase, so this never fires while it's open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Stop the page behind the sheet from scrolling under her thumb.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Phone back button / back swipe closes the sheet instead of leaving the
  // page (and the half-filled form). A marker history entry is pushed on
  // open; going "back" pops it. Closing any other way removes the marker.
  // The deferred back() survives React StrictMode's mount→unmount→mount.
  const markerPushed = useRef(false);
  const pendingBack = useRef<number | null>(null);
  useEffect(() => {
    if (!open) return;
    if (pendingBack.current !== null) {
      window.clearTimeout(pendingBack.current);
      pendingBack.current = null;
    } else if (!markerPushed.current) {
      window.history.pushState({ mcSheet: true }, "");
      markerPushed.current = true;
    }

    function onPop() {
      markerPushed.current = false;
      if (dirtyRef.current) {
        // Keep the sheet (and the marker) until she decides.
        window.history.pushState({ mcSheet: true }, "");
        markerPushed.current = true;
        setConfirmDiscard(true);
      } else {
        onCloseRef.current();
      }
    }
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (markerPushed.current) {
        pendingBack.current = window.setTimeout(() => {
          pendingBack.current = null;
          if (markerPushed.current && window.history.state?.mcSheet) {
            markerPushed.current = false;
            window.history.back();
          }
        }, 0);
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 hidden bg-ink/40 md:block" onClick={requestClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={`relative flex h-full w-full flex-col bg-cream shadow-2xl ${width}`}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-brown/10 bg-cream/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur md:px-4">
          <button
            type="button"
            onClick={requestClose}
            className="flex h-12 w-12 items-center justify-center rounded-full text-brown hover:bg-sand"
            aria-label="Close panel"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
          <h2 id="sheet-title" className="min-w-0 flex-1 truncate py-3 font-display text-2xl font-medium text-ink">
            {title}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-brown/10 bg-cream px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 md:px-6">
            {footer}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        message="You have changes that haven't been saved. If you leave now they'll be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setConfirmDiscard(false);
          onCloseRef.current();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
