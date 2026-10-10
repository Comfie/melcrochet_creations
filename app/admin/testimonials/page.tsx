"use client";

import { useState } from "react";
import { ChevronRight, LoaderCircle, MessageSquareQuote, Star } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { usePagination } from "@/hooks/use-pagination";
import { useLaunchParams } from "@/hooks/use-launch-params";
import SlideOver from "@/components/admin/SlideOver";
import ImageUpload from "@/components/admin/ImageUpload";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Toast from "@/components/admin/Toast";
import Pagination from "@/components/admin/Pagination";
import { Field, FormError, FormSection, Switch, btnDanger, btnPrimary, inputClass } from "@/components/admin/form";
import { EmptyState, ListSkeleton, LoadError, PageHeader, Pill, Thumb } from "@/components/admin/ui";

interface Testimonial {
  id: string;
  customerName: string;
  quote: string;
  location: string | null;
  productName: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  rating: number | null;
  isActive: boolean;
  sortOrder: number;
}

interface FormState {
  customerName: string;
  quote: string;
  location: string;
  productName: string;
  imageUrl: string;
  imagePublicId: string;
  rating: number | null;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  customerName: "",
  quote: "",
  location: "",
  productName: "",
  imageUrl: "",
  imagePublicId: "",
  rating: null,
  isActive: true,
  sortOrder: "0",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex text-gold-deep" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "fill-current" : "opacity-30"}`} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function TestimonialsPage() {
  const { data: testimonials, loading, error, refresh } = useApiList<Testimonial>("/api/testimonials");
  const { mutate, loading: saving } = useApiMutation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmHide, setConfirmHide] = useState(false);

  const dirty = panelOpen && JSON.stringify(form) !== JSON.stringify(initialForm);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setFormError(null);
    setUploading(false);
    setPanelOpen(true);
  }

  function openEdit(t: Testimonial) {
    const start: FormState = {
      customerName: t.customerName,
      quote: t.quote,
      location: t.location ?? "",
      productName: t.productName ?? "",
      imageUrl: t.imageUrl ?? "",
      imagePublicId: t.imagePublicId ?? "",
      rating: t.rating,
      isActive: t.isActive,
      sortOrder: t.sortOrder.toString(),
    };
    setEditing(t);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setUploading(false);
    setPanelOpen(true);
  }

  useLaunchParams(true, (params) => {
    if (params.get("new")) openAdd();
  });

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  async function handleSave() {
    if (uploading) return setFormError("Please wait for the photo to finish uploading.");
    if (!form.customerName.trim()) return setFormError("Add the customer’s name.");
    if (!form.quote.trim()) return setFormError("Add what the customer said.");

    const body = {
      customerName: form.customerName.trim(),
      quote: form.quote.trim(),
      // null (not undefined) so clearing a field on edit actually clears it.
      location: form.location.trim() || null,
      productName: form.productName.trim() || null,
      imageUrl: form.imageUrl || null,
      imagePublicId: form.imagePublicId || null,
      rating: form.rating,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    await mutate(editing ? `/api/testimonials/${editing.id}` : "/api/testimonials", {
      method: editing ? "PATCH" : "POST",
      body,
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({ message: editing ? "Testimonial updated" : "Testimonial added", type: "success" });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleHide() {
    if (!editing) return;
    await mutate(`/api/testimonials/${editing.id}`, {
      method: "DELETE",
      onSuccess: () => {
        setConfirmHide(false);
        setPanelOpen(false);
        refresh();
        setToast({ message: "Testimonial hidden from the website", type: "success" });
      },
      onError: (msg) => {
        setConfirmHide(false);
        setToast({ message: msg, type: "error" });
      },
    });
  }

  const { page, pageItems, totalPages, setPage } = usePagination(testimonials);
  const live = testimonials.filter((t) => t.isActive).length;

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle={loading ? " " : `${live} on the website`}
        action={{ label: "Add testimonial", onClick: openAdd }}
      />

      {loading ? (
        <ListSkeleton />
      ) : error && testimonials.length === 0 ? (
        <LoadError message={error} onRetry={refresh} />
      ) : testimonials.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="h-6 w-6" aria-hidden="true" />}
          title="No testimonials yet"
          message="Paste in kind words from WhatsApp or Instagram — with permission — to build trust with new customers."
          action={
            <button type="button" onClick={openAdd} className={btnPrimary}>
              Add testimonial
            </button>
          }
        />
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2">
          {pageItems.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => openEdit(t)}
                className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-brown/10 transition hover:ring-brown/30 active:bg-sand/40"
              >
                <Thumb
                  url={t.imageUrl}
                  round
                  className={`h-12 w-12 ${t.isActive ? "" : "opacity-50 grayscale"}`}
                  fallback={<span className="font-display text-xl text-brown">{t.customerName.charAt(0)}</span>}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{t.customerName}</span>
                    {t.rating && <Stars rating={t.rating} />}
                  </span>
                  {(t.location || t.productName) && (
                    <span className="block truncate text-xs text-brown/80">
                      {[t.location, t.productName].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <span className="mt-1.5 line-clamp-2 text-sm italic text-brown">“{t.quote}”</span>
                  {!t.isActive && (
                    <span className="mt-2 block">
                      <Pill tone="hidden">Hidden</Pill>
                    </span>
                  )}
                </span>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-brown/50" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit testimonial" : "New testimonial"}
        dirty={dirty}
        footer={
          <div className="space-y-3">
            <FormError message={formError} />
            <div className="flex items-center gap-2">
              {editing?.isActive && (
                <button type="button" onClick={() => setConfirmHide(true)} className={btnDanger}>
                  Remove
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className={`${btnPrimary} ml-auto min-w-40 flex-1 sm:flex-none`}
              >
                {(saving || uploading) && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {uploading ? "Uploading photo…" : saving ? "Saving…" : editing ? "Save changes" : "Add testimonial"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <FormSection title="What they said">
            <Field label="Customer name" htmlFor="test-name" required>
              <input
                id="test-name"
                type="text"
                value={form.customerName}
                onChange={(e) => updateForm("customerName", e.target.value)}
                autoCapitalize="words"
                className={inputClass}
              />
            </Field>
            <Field label="Testimonial" htmlFor="test-quote" required hint="Their words, as they wrote them. Leave out personal details.">
              <textarea
                id="test-quote"
                value={form.quote}
                onChange={(e) => updateForm("quote", e.target.value)}
                rows={5}
                autoCapitalize="sentences"
                className={inputClass}
              />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink">Rating</p>
              <div className="flex items-center gap-1" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = form.rating !== null && n <= form.rating;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateForm("rating", form.rating === n ? null : n)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      aria-pressed={form.rating === n}
                      className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand"
                    >
                      <Star className={`h-7 w-7 ${on ? "fill-gold text-gold-deep" : "text-brown/30"}`} aria-hidden="true" />
                    </button>
                  );
                })}
                {form.rating !== null && (
                  <button
                    type="button"
                    onClick={() => updateForm("rating", null)}
                    className="ml-1 min-h-11 rounded-full px-3 text-sm font-semibold text-brown hover:bg-sand"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Extra details">
            <Field label="Location" htmlFor="test-location" hint="Optional.">
              <input
                id="test-location"
                type="text"
                value={form.location}
                onChange={(e) => updateForm("location", e.target.value)}
                placeholder="e.g. Johannesburg"
                className={inputClass}
              />
            </Field>
            <Field label="What they bought" htmlFor="test-product" hint="Optional.">
              <input
                id="test-product"
                type="text"
                value={form.productName}
                onChange={(e) => updateForm("productName", e.target.value)}
                placeholder="e.g. Baby Throw Blanket"
                className={inputClass}
              />
            </Field>
            <Field label="Photo" hint="Optional — the customer or their piece, with their permission.">
              <ImageUpload
                currentUrl={form.imageUrl || null}
                shape="square"
                onBusyChange={setUploading}
                onRemove={() => setForm((prev) => ({ ...prev, imageUrl: "", imagePublicId: "" }))}
                onUploaded={(url, publicId) => {
                  setForm((prev) => ({ ...prev, imageUrl: url, imagePublicId: publicId }));
                  setFormError(null);
                }}
              />
            </Field>
          </FormSection>

          <FormSection title="Visibility">
            <Switch
              id="test-active"
              label="Show on website"
              checked={form.isActive}
              onChange={(v) => updateForm("isActive", v)}
            />
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-semibold text-brown">
                <ChevronRight className="h-4 w-4 transition group-open:rotate-90" aria-hidden="true" />
                More options
              </summary>
              <div className="pt-2">
                <Field label="Display order" htmlFor="test-sort" hint="Lower numbers show first.">
                  <div className="w-32">
                    <input
                      id="test-sort"
                      type="text"
                      inputMode="numeric"
                      value={form.sortOrder}
                      onChange={(e) => updateForm("sortOrder", e.target.value.replace(/[^\d-]/g, ""))}
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>
            </details>
          </FormSection>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmHide}
        title="Remove from website?"
        message="This hides the testimonial from customers. It stays here so you can switch it back on any time."
        confirmLabel="Remove"
        busy={saving}
        onConfirm={handleHide}
        onCancel={() => setConfirmHide(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
