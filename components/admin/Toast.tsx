"use client";

import { useEffect, useRef } from "react";
import { Check, CircleAlert } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

/** Bottom-centre on phones (above the tab bar), bottom-right on desktop. */
export default function Toast({ message, type, onDismiss }: ToastProps) {
  // Pages pass an inline onDismiss; keep the timer from restarting on every
  // parent re-render (e.g. a background list refresh).
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    // Errors stay up longer — they usually need reading.
    const timer = setTimeout(() => onDismissRef.current(), type === "error" ? 6000 : 3000);
    return () => clearTimeout(timer);
  }, [message, type]);

  const Icon = type === "success" ? Check : CircleAlert;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex justify-center px-4 md:bottom-6 md:justify-end md:px-6">
      <div
        role={type === "error" ? "alert" : "status"}
        className={`pointer-events-auto flex max-w-md animate-rise items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
          type === "success" ? "bg-ink text-cream" : "bg-red-700 text-white"
        }`}
        onClick={onDismiss}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            type === "success" ? "bg-gold text-ink" : "bg-white/20"
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {message}
      </div>
    </div>
  );
}
