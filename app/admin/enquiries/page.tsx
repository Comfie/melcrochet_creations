"use client";

import { useMemo, useState } from "react";
import { Archive, ArchiveRestore, ChevronDown, Inbox, Mail, MailOpen, MessageCircle, Phone } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { usePagination } from "@/hooks/use-pagination";
import Toast from "@/components/admin/Toast";
import Pagination from "@/components/admin/Pagination";
import { EmptyState, FilterChips, ListSkeleton, LoadError, PageHeader } from "@/components/admin/ui";
import { customerTelLink, customerWhatsAppLink } from "@/lib/phone";
import { formatFullDate, formatRelativeDate } from "@/lib/relative-date";

interface Enquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: "NEW" | "READ" | "ARCHIVED";
  createdAt: string;
}

type StatusFilter = "INBOX" | "NEW" | "ARCHIVED" | "ALL";

const ACTION =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition";

function replyMessage(name: string) {
  const first = name.trim().split(/\s+/)[0];
  return `Hi ${first}, thank you for your enquiry with MelCrochet Gifted Hands! `;
}

export default function EnquiriesPage() {
  const { data: enquiries, loading, error, refresh } = useApiList<Enquiry>("/api/enquiries");
  const { mutate } = useApiMutation();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("INBOX");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const counts = useMemo(
    () => ({
      INBOX: enquiries.filter((e) => e.status !== "ARCHIVED").length,
      NEW: enquiries.filter((e) => e.status === "NEW").length,
      ARCHIVED: enquiries.filter((e) => e.status === "ARCHIVED").length,
      ALL: enquiries.length,
    }),
    [enquiries]
  );

  const filtered = enquiries.filter((e) => {
    if (filter === "INBOX") return e.status !== "ARCHIVED";
    if (filter === "ALL") return true;
    return e.status === filter;
  });

  const { page, pageItems, totalPages, setPage, resetPage } = usePagination(filtered);

  async function markStatus(id: string, status: Enquiry["status"], confirmation?: string) {
    await mutate(`/api/enquiries/${id}`, {
      method: "PATCH",
      body: { status },
      onSuccess: () => {
        refresh();
        window.dispatchEvent(new Event("mc:enquiries-updated"));
        if (confirmation) setToast({ message: confirmation, type: "success" });
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
    if (enquiry.status === "NEW") markStatus(enquiry.id, "READ");
  }

  const filterOptions = [
    { value: "INBOX", label: "Inbox", count: counts.INBOX },
    { value: "NEW", label: "Unread", count: counts.NEW },
    { value: "ARCHIVED", label: "Archived", count: counts.ARCHIVED },
    { value: "ALL", label: "All", count: counts.ALL },
  ] as const;

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle={loading ? " " : counts.NEW > 0 ? `${counts.NEW} unread` : "You’re all caught up"}
      />

      <div className="mb-4">
        <FilterChips
          label="Filter enquiries"
          value={filter}
          options={filterOptions}
          onChange={(v) => {
            setFilter(v);
            setExpandedId(null);
            resetPage();
          }}
        />
      </div>

      {loading ? (
        <ListSkeleton />
      ) : error && enquiries.length === 0 ? (
        <LoadError message={error} onRetry={refresh} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" aria-hidden="true" />}
          title={filter === "ARCHIVED" ? "Nothing archived" : "No enquiries here"}
          message="Messages from the website’s contact form will appear here."
        />
      ) : (
        <ul className="space-y-2">
          {pageItems.map((enquiry) => {
            const open = expandedId === enquiry.id;
            const isNew = enquiry.status === "NEW";
            const wa = customerWhatsAppLink(enquiry.phone, replyMessage(enquiry.name));
            const tel = customerTelLink(enquiry.phone);
            return (
              <li
                key={enquiry.id}
                className={`overflow-hidden rounded-2xl bg-white ring-1 transition ${open ? "ring-brown/30" : "ring-brown/10"} ${
                  enquiry.status === "ARCHIVED" ? "opacity-80" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleExpand(enquiry)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${isNew ? "bg-gold" : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-base text-ink ${isNew ? "font-bold" : "font-semibold"}`}>
                        {enquiry.name}
                        {isNew && <span className="sr-only"> (unread)</span>}
                      </span>
                      <time dateTime={enquiry.createdAt} className="shrink-0 text-xs font-medium text-brown/80">
                        {formatRelativeDate(enquiry.createdAt)}
                      </time>
                    </span>
                    {!open && (
                      <span className={`mt-1 line-clamp-2 text-sm ${isNew ? "text-ink" : "text-brown/80"}`}>
                        {enquiry.message}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-brown/50 transition ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {open && (
                  <div className="px-4 pb-4 pl-[2.375rem]">
                    <p className="whitespace-pre-wrap text-base leading-relaxed text-ink">{enquiry.message}</p>
                    <dl className="mt-4 space-y-1 text-sm text-brown">
                      {enquiry.phone && (
                        <div className="flex gap-2">
                          <dt className="sr-only">Phone</dt>
                          <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <dd className="select-all">{enquiry.phone}</dd>
                        </div>
                      )}
                      {enquiry.email && (
                        <div className="flex gap-2">
                          <dt className="sr-only">Email</dt>
                          <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <dd className="select-all break-all">{enquiry.email}</dd>
                        </div>
                      )}
                      <div className="pt-1 text-xs text-brown/80">Received {formatFullDate(enquiry.createdAt)}</div>
                    </dl>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${ACTION} col-span-2 bg-[#25D366] text-ink hover:bg-[#1fbe5a]`}
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          Reply on WhatsApp
                        </a>
                      )}
                      {tel && (
                        <a href={tel} className={`${ACTION} bg-sand text-ink hover:bg-sand/70`}>
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          Call
                        </a>
                      )}
                      {enquiry.email && (
                        <a
                          href={`mailto:${enquiry.email}?subject=${encodeURIComponent("Your MelCrochet enquiry")}`}
                          className={`${ACTION} bg-sand text-ink hover:bg-sand/70`}
                        >
                          <Mail className="h-4 w-4" aria-hidden="true" />
                          Email
                        </a>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-brown/10 pt-3">
                      {enquiry.status === "ARCHIVED" ? (
                        <button
                          type="button"
                          onClick={() => markStatus(enquiry.id, "READ", "Moved back to inbox")}
                          className={`${ACTION} text-brown hover:bg-sand`}
                        >
                          <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                          Move to inbox
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedId(null);
                            markStatus(enquiry.id, "ARCHIVED", "Enquiry archived");
                          }}
                          className={`${ACTION} text-brown hover:bg-sand`}
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                          Archive
                        </button>
                      )}
                      {enquiry.status !== "NEW" && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedId(null);
                            markStatus(enquiry.id, "NEW", "Marked as unread");
                          }}
                          className={`${ACTION} text-brown hover:bg-sand`}
                        >
                          <MailOpen className="h-4 w-4" aria-hidden="true" />
                          Mark unread
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
