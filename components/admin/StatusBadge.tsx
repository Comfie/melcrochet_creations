"use client";

interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  Active: "bg-green-50 text-green-700 ring-green-200",
  Inactive: "bg-gray-50 text-gray-600 ring-gray-200",
  Published: "bg-green-50 text-green-700 ring-green-200",
  Draft: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  NEW: "bg-gold/10 text-brown ring-gold/30",
  READ: "bg-gray-50 text-gray-600 ring-gray-200",
  ARCHIVED: "bg-gray-50 text-gray-400 ring-gray-200",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const className = styles[status] ?? "bg-gray-50 text-gray-600 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {status}
    </span>
  );
}
