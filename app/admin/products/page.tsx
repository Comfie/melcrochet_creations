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
  imageUrl: string | null;
  imagePublicId: string | null;
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
  imageUrl: string;
  imagePublicId: string;
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
  imageUrl: "",
  imagePublicId: "",
  featured: false,
  isActive: true,
  sortOrder: "0",
};

export default function ProductsPage() {
  const { data: products, loading, error, refresh } = useApiList<Product>("/api/products");
  const { data: categories } = useApiList<Category>("/api/categories");
  const { mutate, loading: saving } = useApiMutation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      priceType: product.priceType,
      price: product.price?.toString() ?? "",
      categoryId: product.categoryId,
      sizes: product.sizes ?? "",
      colours: product.colours ?? "",
      leadTime: product.leadTime ?? "",
      imageUrl: product.imageUrl ?? "",
      imagePublicId: product.imagePublicId ?? "",
      featured: product.featured,
      isActive: product.isActive,
      sortOrder: product.sortOrder.toString(),
    });
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.description.trim() || !form.categoryId) {
      setFormError("Name, description, and category are required.");
      return;
    }
    if (form.priceType === "FIXED" && (!form.price || Number(form.price) <= 0)) {
      setFormError("Price is required for fixed-price products.");
      return;
    }

    const body = {
      name: form.name,
      description: form.description,
      priceType: form.priceType,
      price: form.priceType === "FIXED" ? Number(form.price) : null,
      categoryId: form.categoryId,
      sizes: form.sizes || undefined,
      colours: form.colours || undefined,
      leadTime: form.leadTime || undefined,
      imageUrl: form.imageUrl || undefined,
      imagePublicId: form.imagePublicId || undefined,
      featured: form.featured,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PATCH" : "POST";

    await mutate(url, {
      method,
      body,
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({ message: editingId ? "Product updated" : "Product created", type: "success" });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleDelete() {
    if (!editingId) return;
    await mutate(`/api/products/${editingId}`, {
      method: "DELETE",
      onSuccess: () => {
        setConfirmDelete(false);
        setPanelOpen(false);
        refresh();
        setToast({ message: "Product deleted", type: "success" });
      },
      onError: (msg) => {
        setConfirmDelete(false);
        setToast({ message: msg, type: "error" });
      },
    });
  }

  function updateForm(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  const filtered = filterCategory
    ? products.filter((p) => p.categoryId === filterCategory)
    : products;

  if (loading) {
    return <p className="text-sm text-gray-400">Loading products…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90"
        >
          Add Product
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <AdminTable headers={["Image", "Name", "Category", "Price", "Status", "Featured"]}>
        {filtered.map((product) => (
          <tr
            key={product.id}
            onClick={() => openEdit(product)}
            className={`cursor-pointer hover:bg-gray-50 ${
              !product.isActive ? "opacity-50" : ""
            }`}
          >
            <td className="px-4 py-3">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                  —
                </div>
              )}
            </td>
            <td className="px-4 py-3 text-sm font-medium text-ink">
              {product.name}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {product.category.name}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {product.priceType === "FIXED" && product.price
                ? `R${Number(product.price).toLocaleString()}`
                : "Quote"}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={product.isActive ? "Active" : "Inactive"} />
            </td>
            <td className="px-4 py-3 text-sm">
              {product.featured && (
                <span className="text-gold">★</span>
              )}
            </td>
          </tr>
        ))}
      </AdminTable>

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editingId ? "Edit Product" : "Add Product"}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              id="prod-name"
              type="text"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="prod-category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="prod-category"
              value={form.categoryId}
              onChange={(e) => updateForm("categoryId", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prod-desc" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="prod-desc"
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700">Price Type</legend>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="priceType"
                  value="FIXED"
                  checked={form.priceType === "FIXED"}
                  onChange={() => updateForm("priceType", "FIXED")}
                  className="text-brown focus:ring-gold"
                />
                Fixed price
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="priceType"
                  value="QUOTE"
                  checked={form.priceType === "QUOTE"}
                  onChange={() => updateForm("priceType", "QUOTE")}
                  className="text-brown focus:ring-gold"
                />
                Quote on request
              </label>
            </div>
          </fieldset>

          {form.priceType === "FIXED" && (
            <div>
              <label htmlFor="prod-price" className="block text-sm font-medium text-gray-700">
                Price (ZAR) *
              </label>
              <input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
              />
            </div>
          )}

          <div>
            <label htmlFor="prod-sizes" className="block text-sm font-medium text-gray-700">
              Sizes
            </label>
            <input
              id="prod-sizes"
              type="text"
              value={form.sizes}
              onChange={(e) => updateForm("sizes", e.target.value)}
              placeholder="e.g. Small, Medium, Large"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="prod-colours" className="block text-sm font-medium text-gray-700">
              Colours
            </label>
            <input
              id="prod-colours"
              type="text"
              value={form.colours}
              onChange={(e) => updateForm("colours", e.target.value)}
              placeholder="e.g. Cream, Sage, Charcoal"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="prod-lead" className="block text-sm font-medium text-gray-700">
              Lead Time
            </label>
            <input
              id="prod-lead"
              type="text"
              value={form.leadTime}
              onChange={(e) => updateForm("leadTime", e.target.value)}
              placeholder="e.g. 2–3 weeks"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
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

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateForm("featured", e.target.checked)}
                className="rounded text-brown focus:ring-gold"
              />
              Featured
            </label>
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
          </div>

          <div>
            <label htmlFor="prod-sort" className="block text-sm font-medium text-gray-700">
              Sort Order
            </label>
            <input
              id="prod-sort"
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
                  Delete product
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
        title="Delete product"
        message="Are you sure you want to delete this product? It will be marked as inactive."
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
