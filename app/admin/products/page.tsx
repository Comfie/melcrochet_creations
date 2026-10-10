"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ExternalLink, LoaderCircle, Package, Sparkles } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { usePagination } from "@/hooks/use-pagination";
import { useLaunchParams } from "@/hooks/use-launch-params";
import SlideOver from "@/components/admin/SlideOver";
import ImageUpload from "@/components/admin/ImageUpload";
import GalleryUpload from "@/components/admin/GalleryUpload";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Toast from "@/components/admin/Toast";
import Pagination from "@/components/admin/Pagination";
import {
  Field,
  FormSection,
  FormError,
  Segmented,
  Switch,
  btnDanger,
  btnPrimary,
  inputClass,
} from "@/components/admin/form";
import {
  EmptyState,
  FilterChips,
  ListSkeleton,
  LoadError,
  PageHeader,
  Pill,
  SearchField,
  Thumb,
} from "@/components/admin/ui";
import { formatPrice } from "@/lib/format-price";
import { parseGallery, type ProductGalleryImage } from "@/lib/product-gallery";
import { photoCount, RECOMMENDED_PHOTOS, parsePriceInput } from "@/lib/admin-products";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceType: "FIXED" | "QUOTE";
  price: string | null;
  currency: string;
  sizes: string | null;
  colours: string | null;
  leadTime: string | null;
  careInstructions: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  gallery: unknown;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  categoryId: string;
  category: Category;
}

interface FormState {
  name: string;
  description: string;
  priceType: "FIXED" | "QUOTE";
  price: string;
  categoryId: string;
  sizes: string;
  colours: string;
  leadTime: string;
  careInstructions: string;
  imageUrl: string;
  imagePublicId: string;
  gallery: ProductGalleryImage[];
  featured: boolean;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  priceType: "QUOTE",
  price: "",
  categoryId: "",
  sizes: "",
  colours: "",
  leadTime: "",
  careInstructions: "",
  imageUrl: "",
  imagePublicId: "",
  gallery: [],
  featured: false,
  isActive: true,
  sortOrder: "0",
};

type StatusFilter = "ALL" | "LIVE" | "HIDDEN" | "FEATURED" | "PHOTOS";

const PRICE_OPTIONS = [
  { value: "FIXED", label: "Fixed price" },
  { value: "QUOTE", label: "Quote on request" },
] as const;

function toForm(product: Product): FormState {
  return {
    name: product.name,
    description: product.description,
    priceType: product.priceType,
    price: product.price?.toString() ?? "",
    categoryId: product.categoryId,
    sizes: product.sizes ?? "",
    colours: product.colours ?? "",
    leadTime: product.leadTime ?? "",
    careInstructions: product.careInstructions ?? "",
    imageUrl: product.imageUrl ?? "",
    imagePublicId: product.imagePublicId ?? "",
    gallery: parseGallery(product.gallery),
    featured: product.featured,
    isActive: product.isActive,
    sortOrder: product.sortOrder.toString(),
  };
}

export default function ProductsPage() {
  const { data: products, loading, error, refresh } = useApiList<Product>("/api/products");
  const { data: categories } = useApiList<Category>("/api/categories");
  const { mutate, loading: saving } = useApiMutation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [uploadsInFlight, setUploadsInFlight] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmHide, setConfirmHide] = useState(false);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [filterCategory, setFilterCategory] = useState("");

  const dirty = panelOpen && JSON.stringify(form) !== JSON.stringify(initialForm);

  function openAdd() {
    const start = { ...emptyForm, categoryId: filterCategory };
    setEditing(null);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setUploadsInFlight(0);
    setPanelOpen(true);
  }

  function openEdit(product: Product) {
    const start = toForm(product);
    setEditing(product);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setUploadsInFlight(0);
    setPanelOpen(true);
  }

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  function trackUpload(busy: boolean) {
    setUploadsInFlight((n) => Math.max(0, n + (busy ? 1 : -1)));
  }

  /** Swap a gallery photo into the main slot; the old main joins the gallery. */
  function makeMain(img: ProductGalleryImage) {
    setForm((prev) => {
      const rest = prev.gallery.filter((g) => g.publicId !== img.publicId);
      const oldMain = prev.imageUrl && prev.imagePublicId ? [{ url: prev.imageUrl, publicId: prev.imagePublicId }] : [];
      return { ...prev, imageUrl: img.url, imagePublicId: img.publicId, gallery: [...oldMain, ...rest] };
    });
    setFormError(null);
  }

  // Dashboard shortcuts: ?new=1 opens a blank form, ?edit=<id> opens that product.
  useLaunchParams(!loading, (params) => {
    const editId = params.get("edit");
    const product = editId ? products.find((p) => p.id === editId) : undefined;
    if (product) openEdit(product);
    else if (params.get("new")) openAdd();
  });

  async function handleSave() {
    if (uploadsInFlight > 0) {
      setFormError("Please wait for your photos to finish uploading.");
      return;
    }
    if (!form.name.trim()) return setFormError("Give the product a name.");
    if (!form.categoryId) return setFormError("Choose a category.");
    if (!form.description.trim()) return setFormError("Add a short description.");
    const price = parsePriceInput(form.price);
    if (form.priceType === "FIXED" && price === null) {
      return setFormError("Enter a price (e.g. 450), or choose “Quote on request”.");
    }
    if (form.isActive && !form.imageUrl) {
      return setFormError("Add a main photo — or switch off “Show on website” to save this as a draft.");
    }

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      priceType: form.priceType,
      price: form.priceType === "FIXED" ? price : null,
      categoryId: form.categoryId,
      // null (not undefined) so clearing a field on edit actually clears it.
      sizes: form.sizes.trim() || null,
      colours: form.colours.trim() || null,
      leadTime: form.leadTime.trim() || null,
      careInstructions: form.careInstructions.trim() || null,
      imageUrl: form.imageUrl || undefined,
      imagePublicId: form.imagePublicId || undefined,
      gallery: form.gallery,
      featured: form.featured,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    await mutate(editing ? `/api/products/${editing.id}` : "/api/products", {
      method: editing ? "PATCH" : "POST",
      body,
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({
          message: !form.isActive ? "Saved as hidden draft" : editing ? "Product updated" : "Product is live",
          type: "success",
        });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleHide() {
    if (!editing) return;
    await mutate(`/api/products/${editing.id}`, {
      method: "DELETE",
      onSuccess: () => {
        setConfirmHide(false);
        setPanelOpen(false);
        refresh();
        setToast({ message: "Product hidden from the website", type: "success" });
      },
      onError: (msg) => {
        setConfirmHide(false);
        setToast({ message: msg, type: "error" });
      },
    });
  }

  const counts = useMemo(
    () => ({
      ALL: products.length,
      LIVE: products.filter((p) => p.isActive).length,
      HIDDEN: products.filter((p) => !p.isActive).length,
      FEATURED: products.filter((p) => p.featured && p.isActive).length,
      PHOTOS: products.filter((p) => p.isActive && photoCount(p) < RECOMMENDED_PHOTOS).length,
    }),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filterCategory && p.categoryId !== filterCategory) return false;
      if (status === "LIVE" && !p.isActive) return false;
      if (status === "HIDDEN" && p.isActive) return false;
      if (status === "FEATURED" && !(p.featured && p.isActive)) return false;
      if (status === "PHOTOS" && !(p.isActive && photoCount(p) < RECOMMENDED_PHOTOS)) return false;
      if (q && !`${p.name} ${p.category.name}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, status, filterCategory]);

  const { page, pageItems, totalPages, setPage, resetPage } = usePagination(filtered);

  const statusOptions = [
    { value: "ALL", label: "All", count: counts.ALL },
    { value: "LIVE", label: "Live", count: counts.LIVE },
    { value: "HIDDEN", label: "Hidden", count: counts.HIDDEN },
    { value: "FEATURED", label: "Featured", count: counts.FEATURED },
    { value: "PHOTOS", label: "Needs photos", count: counts.PHOTOS },
  ] as const;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={loading ? " " : `${counts.LIVE} live · ${counts.HIDDEN} hidden`}
        action={{ label: "Add product", onClick: openAdd }}
      />

      <div className="mb-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_14rem]">
          <SearchField
            value={query}
            onChange={(v) => {
              setQuery(v);
              resetPage();
            }}
            placeholder="Search products"
          />
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              resetPage();
            }}
            aria-label="Filter by category"
            className={inputClass}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <FilterChips
          label="Filter by status"
          value={status}
          options={statusOptions}
          onChange={(v) => {
            setStatus(v);
            resetPage();
          }}
        />
      </div>

      {loading ? (
        <ListSkeleton />
      ) : error && products.length === 0 ? (
        <LoadError message={error} onRetry={refresh} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" aria-hidden="true" />}
          title={products.length === 0 ? "No products yet" : "Nothing matches"}
          message={
            products.length === 0
              ? "Add your first piece — snap a photo, give it a name and price, and it’s live."
              : "Try a different search, category or filter."
          }
          action={
            products.length === 0 ? (
              <button type="button" onClick={openAdd} className={btnPrimary}>
                Add product
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2">
          {pageItems.map((product) => {
            const photos = photoCount(product);
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-brown/10 transition hover:ring-brown/30 active:bg-sand/40"
                >
                  <Thumb
                    url={product.imageUrl}
                    className={`h-20 w-16 rounded-xl ${product.isActive ? "" : "opacity-50 grayscale"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold leading-snug text-ink">{product.name}</span>
                    <span className="mt-0.5 block truncate text-sm text-brown/80">
                      {product.category.name} · {formatPrice(product.priceType, product.price, product.currency).replace("Quote on Request", "Quote")}
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {product.isActive ? <Pill tone="live">Live</Pill> : <Pill tone="hidden">Hidden</Pill>}
                      {product.featured && (
                        <Pill tone="gold">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          Featured
                        </Pill>
                      )}
                      {product.isActive && photos < RECOMMENDED_PHOTOS && (
                        <Pill tone="draft">
                          {photos} of {RECOMMENDED_PHOTOS} photos
                        </Pill>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-brown/50" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit product" : "New product"}
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
                disabled={saving || uploadsInFlight > 0}
                className={`${btnPrimary} ml-auto min-w-40 flex-1 sm:flex-none`}
              >
                {(saving || uploadsInFlight > 0) && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {uploadsInFlight > 0
                  ? "Uploading photos…"
                  : saving
                    ? "Saving…"
                    : editing
                      ? "Save changes"
                      : form.isActive
                        ? "Publish product"
                        : "Save draft"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {editing?.isActive && (
            <a
              href={`/products/${editing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-gold-deep underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View on website
            </a>
          )}

          <FormSection title="Photos">
            <Field
              label="Main photo"
              hint="Shown on product cards. Portrait works best — natural light, plain cream or neutral background."
            >
              <ImageUpload
                key={form.imagePublicId || "empty"}
                currentUrl={form.imageUrl || null}
                onBusyChange={trackUpload}
                onUploaded={(url, publicId) => {
                  setForm((prev) => ({ ...prev, imageUrl: url, imagePublicId: publicId }));
                  setFormError(null);
                }}
              />
            </Field>
            <Field
              label="More photos"
              hint={`Aim for at least ${RECOMMENDED_PHOTOS} photos in total: the whole piece, a close-up of the stitches, and the piece being worn or used.`}
            >
              <GalleryUpload
                value={form.gallery}
                onChange={(gallery) => updateForm("gallery", gallery)}
                onBusyChange={trackUpload}
                onMakeMain={makeMain}
              />
            </Field>
          </FormSection>

          <FormSection title="Details">
            <Field label="Name" htmlFor="prod-name" required>
              <input
                id="prod-name"
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                autoCapitalize="words"
                enterKeyHint="next"
                className={inputClass}
              />
            </Field>
            <Field label="Category" htmlFor="prod-category" required>
              <select
                id="prod-category"
                value={form.categoryId}
                onChange={(e) => updateForm("categoryId", e.target.value)}
                className={inputClass}
              >
                <option value="">Choose a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" htmlFor="prod-desc" required hint="What it is, the yarn, how it feels — a few warm sentences.">
              <textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={5}
                autoCapitalize="sentences"
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="Price">
            <Segmented
              name="priceType"
              legend="How is it priced?"
              value={form.priceType}
              options={PRICE_OPTIONS}
              onChange={(v) => updateForm("priceType", v)}
            />
            {form.priceType === "FIXED" ? (
              <Field label="Price" htmlFor="prod-price" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-brown">R</span>
                  <input
                    id="prod-price"
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    placeholder="450"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </Field>
            ) : (
              <p className="text-sm text-brown/80">Customers will see “Quote on request” and message you on WhatsApp for a price.</p>
            )}
          </FormSection>

          <FormSection title="Options">
            <Field label="Sizes" htmlFor="prod-sizes" hint="Separate with commas — customers pick one when ordering.">
              <input
                id="prod-sizes"
                type="text"
                value={form.sizes}
                onChange={(e) => updateForm("sizes", e.target.value)}
                placeholder="e.g. 0–3 months, 3–6 months, 6–12 months"
                className={inputClass}
              />
            </Field>
            <Field label="Colours" htmlFor="prod-colours" hint="Separate with commas.">
              <input
                id="prod-colours"
                type="text"
                value={form.colours}
                onChange={(e) => updateForm("colours", e.target.value)}
                placeholder="e.g. Cream, Sage, Charcoal"
                className={inputClass}
              />
            </Field>
            <Field label="Lead time" htmlFor="prod-lead" hint="Optional — how long this piece takes to make.">
              <input
                id="prod-lead"
                type="text"
                value={form.leadTime}
                onChange={(e) => updateForm("leadTime", e.target.value)}
                placeholder="e.g. 2–3 weeks"
                className={inputClass}
              />
            </Field>
            <Field label="Care instructions" htmlFor="prod-care" hint="Leave blank to show the standard care advice.">
              <textarea
                id="prod-care"
                value={form.careInstructions}
                onChange={(e) => updateForm("careInstructions", e.target.value)}
                rows={2}
                placeholder="e.g. Hand wash cold, dry flat"
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="Visibility">
            <Switch
              id="prod-active"
              label="Show on website"
              description={form.isActive ? "Customers can see and order this piece." : "Hidden draft — only you can see it here."}
              checked={form.isActive}
              onChange={(v) => updateForm("isActive", v)}
            />
            <Switch
              id="prod-featured"
              label="Feature on home page"
              description="Appears in Signature Pieces on the home page."
              checked={form.featured}
              onChange={(v) => updateForm("featured", v)}
            />
            <details className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-semibold text-brown">
                <ChevronRight className="h-4 w-4 transition group-open:rotate-90" aria-hidden="true" />
                More options
              </summary>
              <div className="pt-2">
                <Field label="Display order" htmlFor="prod-sort" hint="Lower numbers show first. Leave at 0 if you’re not sure.">
                  <div className="w-32">
                    <input
                      id="prod-sort"
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
        message="This hides the product from customers. It stays here under “Hidden”, so you can switch it back on any time."
        confirmLabel="Remove"
        busy={saving}
        onConfirm={handleHide}
        onCancel={() => setConfirmHide(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
