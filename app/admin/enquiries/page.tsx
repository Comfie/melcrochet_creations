"use client";

import { useState } from "react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import Toast from "@/components/admin/Toast";
import StatusBadge from "@/components/admin/StatusBadge";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/use-pagination";

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  createdAt: string;
}

type StatusFilter = "ALL" | "NEW" | "READ" | "ARCHIVED";

export default function EnquiriesPage() {
  const { data: enquiries, loading, error, refresh } = useApiList<Enquiry>("/api/enquiries");
  const { mutate } = useApiMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const counts = {
    ALL: enquiries.length,
    NEW: enquiries.filter((e) => e.status === "NEW").length,
    READ: enquiries.filter((e) => e.status === "READ").length,
    ARCHIVED: enquiries.filter((e) => e.status === "ARCHIVED").length,
  };

  const filtered = filter === "ALL" ? enquiries : enquiries.filter((e) => e.status === filter);

  const { page, pageItems, totalPages, setPage, resetPage } = usePagination(filtered);

  async function markStatus(id: string, status: "READ" | "ARCHIVED") {
    await mutate(`/api/enquiries/${id}`, {
      method: "PATCH",
      body: { status },
      onSuccess: () => {
        refresh();
        window.dispatchEvent(new Event("mc:enquiries-updated"));
      },
      onError: (msg) => setToast({ message: msg, type: "error" }),
    });
  }

  function handleExpand(enquiry: Enquiry) {
    if (expandedId === enquiry.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(enquiry.id);
    if (enquiry.status === "NEW") {
      markStatus(enquiry.id, "READ");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading enquiries…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Enquiries</h1>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
        {(["ALL", "NEW", "READ", "ARCHIVED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              resetPage();
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filter === tab
                ? "bg-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-1.5 text-xs text-gray-400">({counts[tab]})</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg ring-1 ring-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Message</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {pageItems.map((enquiry) => (
              <tr key={enquiry.id} className="group">
                <td colSpan={6} className="p-0">
                  <button
                    onClick={() => handleExpand(enquiry)}
                    className={`grid w-full grid-cols-[1fr_1fr_1fr_2fr_auto_auto] gap-0 text-left hover:bg-gray-50 ${
                      enquiry.status === "NEW" ? "font-semibold" : ""
                    }`}
                  >
                    <span className="px-4 py-3 text-sm text-ink">
                      {enquiry.status === "NEW" && (
                        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-brown" />
                      )}
                      {enquiry.name}
                    </span>
                    <span className="truncate px-4 py-3 text-sm text-gray-600">
                      {enquiry.email ?? "—"}
                    </span>
                    <span className="px-4 py-3 text-sm text-gray-600">
                      {enquiry.phone ?? "—"}
                    </span>
                    <span className="truncate px-4 py-3 text-sm text-gray-600">
                      {enquiry.message}
                    </span>
                    <span className="px-4 py-3">
                      <StatusBadge status={enquiry.status} />
                    </span>
                    <span className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {formatDate(enquiry.createdAt)}
                    </span>
                  </button>

                  {expandedId === enquiry.id && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {enquiry.message}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        {enquiry.email && (
                          <a
                            href={`mailto:${enquiry.email}`}
                            className="text-brown hover:underline"
                          >
                            Reply via email
                          </a>
                        )}
                        {enquiry.status !== "ARCHIVED" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markStatus(enquiry.id, "ARCHIVED");
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  No enquiries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
