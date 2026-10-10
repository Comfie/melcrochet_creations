"use client";

import { useEffect, useRef } from "react";

/**
 * Runs once, as soon as `ready`, with the page's query string — used by the
 * dashboard shortcuts (`/admin/products?new=1`, `?edit=<id>`) to open a form
 * straight away. The query is then stripped from the URL so a refresh, or
 * coming back to the page, doesn't reopen the form.
 */
export function useLaunchParams(ready: boolean, onLaunch: (params: URLSearchParams) => void) {
  const done = useRef(false);
  const onLaunchRef = useRef(onLaunch);
  useEffect(() => {
    onLaunchRef.current = onLaunch;
  });

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return;
    window.history.replaceState(null, "", window.location.pathname);
    onLaunchRef.current(params);
  }, [ready]);
}
