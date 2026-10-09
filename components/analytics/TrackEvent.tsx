"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

/** Fires one analytics event when it mounts — e.g. view_item on a product page. */
export default function TrackEvent({ name, params }: { name: string; params?: AnalyticsParams }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent(name, params);
  }, [name, params]);

  return null;
}
