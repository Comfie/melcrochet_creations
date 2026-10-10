"use client";

import { useCallback, useEffect, useRef } from "react";

function discardOnServer(publicIds: string[]) {
  if (publicIds.length === 0) return;
  fetch("/api/uploads/discard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicIds }),
  }).catch(() => {
    // Best effort — a leftover photo is harmless, just untidy.
  });
}

/**
 * Remembers photos uploaded while a form is open so the ones that never
 * get saved are removed from Cloudinary:
 *  - `discard()` when the form is cancelled → deletes everything uploaded
 *  - `commit(keptIds)` after a successful save → deletes uploads the saved
 *    record doesn't use (e.g. a photo she replaced before saving)
 * The server double-checks and never deletes a photo that is in use.
 */
export function useUploadSession() {
  const pending = useRef<Set<string>>(new Set());

  const track = useCallback((publicId: string) => {
    pending.current.add(publicId);
  }, []);

  const discard = useCallback(() => {
    const ids = [...pending.current];
    pending.current.clear();
    discardOnServer(ids);
  }, []);

  const commit = useCallback((keptIds: (string | null | undefined)[]) => {
    const kept = new Set(keptIds.filter(Boolean));
    const ids = [...pending.current].filter((id) => !kept.has(id));
    pending.current.clear();
    discardOnServer(ids);
  }, []);

  // Leaving the page with the form still open (e.g. via the sidebar).
  useEffect(() => discard, [discard]);

  return { track, discard, commit };
}
