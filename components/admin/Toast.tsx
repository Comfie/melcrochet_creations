"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed right-4 top-4 z-50 animate-fade-in">
      <div
        className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
          type === "success"
            ? "bg-green-50 text-green-800 ring-1 ring-green-200"
            : "bg-red-50 text-red-800 ring-1 ring-red-200"
        }`}
        role="status"
      >
        {message}
      </div>
    </div>
  );
}
