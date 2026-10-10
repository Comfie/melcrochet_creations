"use client";

import { useState } from "react";

interface MutateOptions {
  method?: string;
  body?: unknown;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

export function useApiMutation() {
  const [loading, setLoading] = useState(false);

  async function mutate(url: string, options: MutateOptions = {}): Promise<boolean> {
    const { method = "POST", body, onSuccess, onError } = options;
    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return false;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          details?: { message?: string }[];
        };
        // Validation errors carry the specific reason in details[0].
        const msg = data.details?.[0]?.message ?? data.error ?? "Something went wrong";
        onError?.(msg);
        return false;
      }

      onSuccess?.();
      return true;
    } catch {
      onError?.("Something went wrong");
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { mutate, loading };
}
