"use client";

import { useState } from "react";
import Markdown from "react-markdown";
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  youtubeUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImagePublicId: string;
  youtubeUrl: string;
  published: boolean;
}

const emptyForm: FormState = {
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImagePublicId: "",
  youtubeUrl: "",
  published: false,
};

export default function BlogPage() {
  const { data: posts, loading, error, refresh } = useApiList<BlogPost>("/api/blog");
  const { mutate, loading: saving } = useApiMutation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setPreviewMode(false);
    setPanelOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? "",
      coverImagePublicId: post.coverImagePublicId ?? "",
      youtubeUrl: post.youtubeUrl ?? "",
      published: post.published,
    });
    setFormError(null);
    setPreviewMode(false);
    setPanelOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required.");
      return;
    }

    const body = {
      title: form.title,
      excerpt: form.excerpt || undefined,
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
      coverImagePublicId: form.coverImagePublicId || undefined,
      youtubeUrl: form.youtubeUrl || undefined,
      published: form.published,
    };

    const url = editingId ? `/api/blog/${editingId}` : "/api/blog";
    const method = editingId ? "PATCH" : "POST";

    await mutate(url, {
      method,
      body,
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({ message: editingId ? "Post updated" : "Post created", type: "success" });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleDelete() {
    if (!editingId) return;
    await mutate(`/api/blog/${editingId}`, {
      method: "DELETE",
      onSuccess: () => {
        setConfirmDelete(false);
        setPanelOpen(false);
        refresh();
        setToast({ message: "Post deleted", type: "success" });
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const { page, pageItems, totalPages, setPage } = usePagination(posts);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading posts…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Blog</h1>
        <button
          onClick={openAdd}
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-gold/90"
        >
          New Post
        </button>
      </div>

      <AdminTable headers={["Cover", "Title", "Status", "Published", "Created"]}>
        {pageItems.map((post) => (
          <tr
            key={post.id}
            onClick={() => openEdit(post)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <td className="px-4 py-3">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.coverImageUrl} alt={post.title} className="h-10 w-14 rounded object-cover" />
              ) : (
                <div className="flex h-10 w-14 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                  —
                </div>
              )}
            </td>
            <td className="px-4 py-3 text-sm font-medium text-ink">{post.title}</td>
            <td className="px-4 py-3">
              <StatusBadge status={post.published ? "Published" : "Draft"} />
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {post.publishedAt ? formatDate(post.publishedAt) : "—"}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {formatDate(post.createdAt)}
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editingId ? "Edit Post" : "New Post"}
        width="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="blog-title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              id="blog-title"
              type="text"
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label htmlFor="blog-excerpt" className="block text-sm font-medium text-gray-700">
              Excerpt
            </label>
            <textarea
              id="blog-excerpt"
              value={form.excerpt}
              onChange={(e) => updateForm("excerpt", e.target.value)}
              rows={2}
              placeholder="Short summary for cards and SEO"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Image</label>
            <div className="mt-1">
              <ImageUpload
                currentUrl={form.coverImageUrl || null}
                onUploaded={(url, publicId) => {
                  updateForm("coverImageUrl", url);
                  setForm((prev) => ({ ...prev, coverImagePublicId: publicId }));
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="blog-youtube" className="block text-sm font-medium text-gray-700">
              YouTube URL
            </label>
            <input
              id="blog-youtube"
              type="url"
              value={form.youtubeUrl}
              onChange={(e) => updateForm("youtubeUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Content *
              </label>
              <div className="flex gap-1 rounded-md bg-gray-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    !previewMode ? "bg-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`rounded px-3 py-1 text-xs font-medium ${
                    previewMode ? "bg-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            {previewMode ? (
              <div className="prose prose-neutral mt-1 max-h-96 overflow-y-auto rounded-md border border-gray-300 p-4 text-sm prose-headings:font-display prose-a:text-brown">
                {form.content ? (
                  <Markdown>{form.content}</Markdown>
                ) : (
                  <p className="text-gray-400">Nothing to preview</p>
                )}
              </div>
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => updateForm("content", e.target.value)}
                rows={12}
                placeholder="Write your post in Markdown…"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-brown"
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateForm("published", e.target.checked)}
              className="rounded text-brown focus:ring-gold"
            />
            Published
          </label>

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
                  Delete post
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
        title="Delete post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
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
