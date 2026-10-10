"use client";

import { useState, useEffect, useCallback } from "react";

export function useApiList<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  // Only true until the first response. Later refreshes (after a save, or
  // when the tab regains focus) update the list in place so the page
  // doesn't blank out and lose the phone's scroll position.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError((body as { error?: string }).error ?? "Something went wrong");
        return;
      }
      const json = (await res.json()) as T[];
      setData(json);
      setError(null);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // On a phone the admin is often left open in a background tab (or as a
  // home-screen app, which has no pull-to-refresh). Refetch when it comes
  // back to the foreground so new enquiries and edits made elsewhere show.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") fetchData();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
