"use client";

import { useState } from "react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import SlideOver from "@/components/admin/SlideOver";
import ImageUpload from "@/components/admin/ImageUpload";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Toast from "@/components/admin/Toast";
import AdminTable from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Pagination from "@/components/admin/Pagination";
import { usePagination } from "@/hooks/use-pagination";

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

export default function TestimonialsPage() {
  const { data: testimonials, loading, error, refresh } = useApiList<Testimonial>("/api/testimonials");
  const { mutate, loading: saving } = useApiMutation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(t: Testimonial) {
    setEditingId(t.id);
    setForm({
      customerName: t.customerName,
      quote: t.quote,
      location: t.location ?? "",
      productName: t.productName ?? "",
      imageUrl: t.imageUrl ?? "",
      imagePublicId: t.imagePublicId ?? "",
      rating: t.rating,
      isActive: t.isActive,
      sortOrder: t.sortOrder.toString(),
    });
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.customerName.trim() || !form.quote.trim()) {
      setFormError("Customer name and quote are required.");
      return;
    }

    const body = {
      customerName: form.customerName,
      quote: form.quote,
      location: form.location || undefined,
      productName: form.productName || undefined,
      imageUrl: form.imageUrl || undefined,
      imagePublicId: form.imagePublicId || undefined,
      rating: form.rating ?? undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
    const method = editingId ? "PATCH" : "POST";

    await mutate(url, {
      method,
      body,
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({ message: editingId ? "Testimonial updated" : "Testimonial created", type: "success" });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleDelete() {
    if (!editingId) return;
    await mutate(`/api/testimonials/${editingId}`, {
      method: "DELETE",
      onSuccess: () => {
        setConfirmDelete(false);
        setPanelOpen(false);
        refresh();
        setToast({ message: "Testimonial deleted", type: "success" });
      },
      onError: (msg) => {
        setConfirmDelete(false);
        setToast({ message: msg, type: "error" });
      },
    });
  }

  function updateForm(field: keyof FormState, value: string | boolean | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  const { page, pageItems, totalPages, setPage } = usePagination(testimonials);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading testimonials…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Testimonials</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90"
        >
          Add Testimonial
        </button>
      </div>

      <AdminTable headers={["Photo", "Customer", "Quote", "Rating", "Status"]}>
        {pageItems.map((t) => (
          <tr
            key={t.id}
            onClick={() => openEdit(t)}
            className={`cursor-pointer hover:bg-gray-50 ${!t.isActive ? "opacity-50" : ""}`}
          >
            <td className="px-4 py-3">
              {t.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.imageUrl} alt={t.customerName} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                  {t.customerName.charAt(0)}
                </div>
              )}
            </td>
            <td className="px-4 py-3 text-sm font-medium text-ink">{t.customerName}</td>
            <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">{t.quote}</td>
            <td className="px-4 py-3 text-sm text-brown">
              {t.rating ? "★".repeat(t.rating) : "—"}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={t.isActive ? "Active" : "Inactive"} />
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editingId ? "Edit Testimonial" : "Add Testimonial"}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="test-name" className="block text-sm font-medium text-gray-700">
              Customer Name *
            </label>
            <input
              id="test-name"
              type="text"
              value={form.customerName}
              onChange={(e) => updateForm("customerName", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="test-quote" className="block text-sm font-medium text-gray-700">
              Quote *
            </label>
            <textarea
              id="test-quote"
              value={form.quote}
              onChange={(e) => updateForm("quote", e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="test-location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="test-location"
              type="text"
              value={form.location}
              onChange={(e) => updateForm("location", e.target.value)}
              placeholder="e.g. Johannesburg"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="test-product" className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              id="test-product"
              type="text"
              value={form.productName}
              onChange={(e) => updateForm("productName", e.target.value)}
              placeholder="e.g. Baby Throw Blanket"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateForm("rating", form.rating === n ? null : n)}
                  className={`text-2xl transition ${
                    form.rating !== null && n <= form.rating ? "text-brown" : "text-gray-300"
                  }`}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
              {form.rating && (
                <button
                  type="button"
                  onClick={() => updateForm("rating", null)}
                  className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Photo</label>
            <div className="mt-1">
              <ImageUpload
                currentUrl={form.imageUrl || null}
                onUploaded={(url, publicId) => {
                  updateForm("imageUrl", url);
                  setForm((prev) => ({ ...prev, imagePublicId: publicId }));
                }}
              />
            </div>
          </div>

          {editingId && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateForm("isActive", e.target.checked)}
                className="rounded text-brown focus:ring-gold"
              />
              Active
            </label>
          )}

          <div>
            <label htmlFor="test-sort" className="block text-sm font-medium text-gray-700">
              Sort Order
            </label>
            <input
              id="test-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) => updateForm("sortOrder", e.target.value)}
              className="mt-1 block w-24 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete testimonial
                </button>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete testimonial"
        message="Are you sure you want to delete this testimonial? It will be marked as inactive."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

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
