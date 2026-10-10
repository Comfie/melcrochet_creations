"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, LoaderCircle, Tags } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useLaunchParams } from "@/hooks/use-launch-params";
import SlideOver from "@/components/admin/SlideOver";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Toast from "@/components/admin/Toast";
import { Field, FormError, FormSection, btnDanger, btnPrimary, inputClass } from "@/components/admin/form";
import { EmptyState, ListSkeleton, LoadError, PageHeader } from "@/components/admin/ui";

interface Category {
  id: string;
  name: string;
  slug: string;
  blurb: string | null;
  sortOrder: number;
  _count: { products: number };
}

interface FormState {
  name: string;
  blurb: string;
}

const emptyForm: FormState = { name: "", blurb: "" };

const ARROW =
  "flex h-11 w-11 items-center justify-center rounded-full text-brown ring-1 ring-brown/15 transition hover:ring-brown/40 disabled:opacity-30";

export default function CategoriesPage() {
  const { data: categories, loading, error, refresh } = useApiList<Category>("/api/categories");
  const { mutate, loading: saving } = useApiMutation();

  const [localOrder, setLocalOrder] = useState<Category[] | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const list = localOrder ?? categories;
  const dirty = panelOpen && JSON.stringify(form) !== JSON.stringify(initialForm);

  function open(category: Category | null) {
    const start = category ? { name: category.name, blurb: category.blurb ?? "" } : emptyForm;
    setEditing(category);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setPanelOpen(true);
  }

  useLaunchParams(true, (params) => {
    if (params.get("new")) open(null);
  });

  async function move(index: number, delta: -1 | 1) {
    const next = [...list];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocalOrder(next);
    await mutate("/api/categories/order", {
      method: "PUT",
      body: { ids: next.map((c) => c.id) },
      onSuccess: async () => {
        await refresh();
        setLocalOrder(null);
      },
      onError: (msg) => {
        setLocalOrder(null);
        setToast({ message: msg, type: "error" });
      },
    });
  }

  async function handleSave() {
    if (!form.name.trim()) return setFormError("Give the category a name.");
    await mutate(editing ? `/api/categories/${editing.id}` : "/api/categories", {
      method: editing ? "PATCH" : "POST",
      body: { name: form.name.trim(), blurb: form.blurb.trim() || null },
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({ message: editing ? "Category updated" : "Category added", type: "success" });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleDelete() {
    if (!editing) return;
    await mutate(`/api/categories/${editing.id}`, {
      method: "DELETE",
      onSuccess: () => {
        setConfirmDelete(false);
        setPanelOpen(false);
        refresh();
        setToast({ message: "Category deleted", type: "success" });
      },
      onError: (msg) => {
        setConfirmDelete(false);
        setToast({ message: msg, type: "error" });
      },
    });
  }

  const productCount = editing?._count.products ?? 0;

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="The order here is the order customers see in the shop."
        action={{ label: "Add category", onClick: () => open(null) }}
      />

      {loading ? (
        <ListSkeleton />
      ) : error && categories.length === 0 ? (
        <LoadError message={error} onRetry={refresh} />
      ) : list.length === 0 ? (
        <EmptyState icon={<Tags className="h-6 w-6" aria-hidden="true" />} title="No categories yet" />
      ) : (
        <ol className="space-y-2">
          {list.map((category, i) => (
            <li key={category.id} className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 ring-1 ring-brown/10">
              <button type="button" onClick={() => open(category)} className="min-w-0 flex-1 py-2 text-left">
                <span className="block font-semibold text-ink">{category.name}</span>
                <span className="block truncate text-sm text-brown/80">
                  {category._count.products} product{category._count.products === 1 ? "" : "s"}
                  {category.blurb ? ` · ${category.blurb}` : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0 || saving}
                aria-label={`Move ${category.name} up`}
                className={ARROW}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1 || saving}
                aria-label={`Move ${category.name} down`}
                className={ARROW}
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit category" : "New category"}
        dirty={dirty}
        footer={
          <div className="space-y-3">
            <FormError message={formError} />
            <div className="flex items-center gap-2">
              {editing && productCount === 0 && (
                <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`${btnPrimary} ml-auto min-w-40 flex-1 sm:flex-none`}
              >
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {saving ? "Saving…" : editing ? "Save changes" : "Add category"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {editing && (
            <a
              href={`/products?category=${editing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-gold-deep underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View in the shop
            </a>
          )}
          <FormSection title="Category">
            <Field
              label="Name"
              htmlFor="cat-name"
              required
              hint={editing ? "Renaming keeps the same web address, so existing links keep working." : undefined}
            >
              <input
                id="cat-name"
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  setFormError(null);
                }}
                autoCapitalize="words"
                placeholder="e.g. Table Runners"
                className={inputClass}
              />
            </Field>
            <Field
              label="Short description"
              htmlFor="cat-blurb"
              hint="Optional — shown in the shop when customers browse this category."
            >
              <textarea
                id="cat-blurb"
                value={form.blurb}
                onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
                rows={3}
                maxLength={500}
                autoCapitalize="sentences"
                className={inputClass}
              />
            </Field>
          </FormSection>

          {!editing && (
            <p className="rounded-2xl bg-sand p-4 text-sm text-brown">
              New categories appear in the shop straight away. The home page collections (like “Baby &amp; Kids”) are
              set up separately, so a new category won’t show there until it’s added to one.
            </p>
          )}
          {editing && productCount > 0 && (
            <p className="text-sm text-brown/80">
              This category has {productCount} product{productCount === 1 ? "" : "s"} (including hidden ones). Move them to
              another category first if you want to delete it.
            </p>
          )}
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this category?"
        message="It has no products, so nothing on the website will be lost."
        confirmLabel="Delete category"
        busy={saving}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
