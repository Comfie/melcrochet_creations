"use client";

import { useRef, useState } from "react";
import Markdown from "react-markdown";
import { Bold, ChevronRight, ExternalLink, Heading2, Italic, List, LoaderCircle, Newspaper } from "lucide-react";
import { useApiList } from "@/hooks/use-api-list";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { usePagination } from "@/hooks/use-pagination";
import { useLaunchParams } from "@/hooks/use-launch-params";
import SlideOver from "@/components/admin/SlideOver";
import ImageUpload from "@/components/admin/ImageUpload";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Toast from "@/components/admin/Toast";
import Pagination from "@/components/admin/Pagination";
import { Field, FormError, FormSection, Segmented, Switch, btnDanger, btnPrimary, inputClass } from "@/components/admin/form";
import { EmptyState, ListSkeleton, LoadError, PageHeader, Pill, Thumb } from "@/components/admin/ui";
import { extractYouTubeId } from "@/lib/youtube";
import { formatRelativeDate } from "@/lib/relative-date";
import { applyMarkdown, type MarkdownAction } from "@/lib/markdown-edit";

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

const MODES = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
] as const;

const TOOLS: { action: MarkdownAction; label: string; icon: typeof Bold }[] = [
  { action: "heading", label: "Heading", icon: Heading2 },
  { action: "bold", label: "Bold", icon: Bold },
  { action: "italic", label: "Italic", icon: Italic },
  { action: "list", label: "Bullet list", icon: List },
];

export default function BlogPage() {
  const { data: posts, loading, error, refresh } = useApiList<BlogPost>("/api/blog");
  const { mutate, loading: saving } = useApiMutation();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [initialForm, setInitialForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const dirty = panelOpen && JSON.stringify(form) !== JSON.stringify(initialForm);

  function open(start: FormState, post: BlogPost | null) {
    setEditing(post);
    setForm(start);
    setInitialForm(start);
    setFormError(null);
    setUploading(false);
    setMode("write");
    setPanelOpen(true);
  }

  function openEdit(post: BlogPost) {
    open(
      {
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content,
        coverImageUrl: post.coverImageUrl ?? "",
        coverImagePublicId: post.coverImagePublicId ?? "",
        youtubeUrl: post.youtubeUrl ?? "",
        published: post.published,
      },
      post
    );
  }

  useLaunchParams(true, (params) => {
    if (params.get("new")) open(emptyForm, null);
  });

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  }

  function format(action: MarkdownAction) {
    const el = contentRef.current;
    if (!el) return;
    const result = applyMarkdown(form.content, el.selectionStart, el.selectionEnd, action);
    updateForm("content", result.value);
    // Restore the caret after React re-renders the textarea.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  async function handleSave() {
    if (uploading) return setFormError("Please wait for the cover photo to finish uploading.");
    if (!form.title.trim()) return setFormError("Give the post a title.");
    if (!form.content.trim()) return setFormError("Write something in the post before saving.");
    const youtubeUrl = form.youtubeUrl.trim();
    if (youtubeUrl && !extractYouTubeId(youtubeUrl)) {
      return setFormError("That doesn’t look like a YouTube video link. Copy it from the Share button on YouTube.");
    }

    const body = {
      title: form.title.trim(),
      // null (not undefined) so clearing a field on edit actually clears it.
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      coverImageUrl: form.coverImageUrl || null,
      coverImagePublicId: form.coverImagePublicId || null,
      youtubeUrl: youtubeUrl || null,
      published: form.published,
    };

    await mutate(editing ? `/api/blog/${editing.id}` : "/api/blog", {
      method: editing ? "PATCH" : "POST",
      body,
      onSuccess: () => {
        setPanelOpen(false);
        refresh();
        setToast({ message: form.published ? "Post is live" : "Draft saved", type: "success" });
      },
      onError: (msg) => setFormError(msg),
    });
  }

  async function handleDelete() {
    if (!editing) return;
    await mutate(`/api/blog/${editing.id}`, {
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

  const { page, pageItems, totalPages, setPage } = usePagination(posts);
  const drafts = posts.filter((p) => !p.published).length;

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={loading ? " " : `${posts.length - drafts} published · ${drafts} draft${drafts === 1 ? "" : "s"}`}
        action={{ label: "New post", onClick: () => open(emptyForm, null) }}
      />

      {loading ? (
        <ListSkeleton />
      ) : error && posts.length === 0 ? (
        <LoadError message={error} onRetry={refresh} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-6 w-6" aria-hidden="true" />}
          title="No posts yet"
          message="Share a new collection, a behind-the-stitches story or care tips."
          action={
            <button type="button" onClick={() => open(emptyForm, null)} className={btnPrimary}>
              New post
            </button>
          }
        />
      ) : (
        <ul className="grid gap-2 lg:grid-cols-2">
          {pageItems.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => openEdit(post)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-brown/10 transition hover:ring-brown/30 active:bg-sand/40"
              >
                <Thumb url={post.coverImageUrl} className="h-16 w-24 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-semibold leading-snug text-ink">{post.title}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2">
                    {post.published ? <Pill tone="live">Published</Pill> : <Pill tone="draft">Draft</Pill>}
                    <span className="text-xs text-brown/80">
                      {post.published && post.publishedAt
                        ? formatRelativeDate(post.publishedAt)
                        : `Started ${formatRelativeDate(post.createdAt)}`}
                    </span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-brown/50" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <SlideOver
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={editing ? "Edit post" : "New post"}
        width="md:max-w-2xl"
        dirty={dirty}
        footer={
          <div className="space-y-3">
            <FormError message={formError} />
            <div className="flex items-center gap-2">
              {editing && (
                <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className={`${btnPrimary} ml-auto min-w-40 flex-1 sm:flex-none`}
              >
                {(saving || uploading) && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {uploading
                  ? "Uploading photo…"
                  : saving
                    ? "Saving…"
                    : form.published
                      ? editing?.published
                        ? "Save changes"
                        : "Publish post"
                      : "Save draft"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {editing?.published && (
            <a
              href={`/blog/${editing.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-gold-deep underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View on website
            </a>
          )}

          <FormSection title="Post">
            <Field label="Title" htmlFor="blog-title" required>
              <input
                id="blog-title"
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                autoCapitalize="sentences"
                className={inputClass}
              />
            </Field>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  Content <span className="font-normal text-brown/70">(required)</span>
                </p>
                <div className="w-48">
                  <Segmented name="blog-mode" legend="Editor mode" hideLegend value={mode} options={MODES} onChange={setMode} />
                </div>
              </div>
              {mode === "preview" ? (
                <div className="prose prose-neutral min-h-72 max-w-none rounded-xl bg-white p-4 ring-1 ring-brown/20 prose-headings:font-display prose-a:text-gold-deep">
                  {form.content.trim() ? <Markdown>{form.content}</Markdown> : <p className="text-brown/60">Nothing to preview yet.</p>}
                </div>
              ) : (
                <>
                  <div className="mb-2 flex gap-1" role="toolbar" aria-label="Formatting">
                    {TOOLS.map(({ action, label, icon: Icon }) => (
                      <button
                        key={action}
                        type="button"
                        // Keep the textarea's selection when tapping a tool.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format(action)}
                        aria-label={label}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-ink ring-1 ring-brown/15 hover:ring-brown/40"
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="blog-content"
                    ref={contentRef}
                    aria-label="Content"
                    value={form.content}
                    onChange={(e) => updateForm("content", e.target.value)}
                    rows={14}
                    autoCapitalize="sentences"
                    placeholder="Start writing… Leave an empty line between paragraphs."
                    className={`${inputClass} leading-relaxed`}
                  />
                </>
              )}
            </div>

            <Field
              label="Summary"
              htmlFor="blog-excerpt"
              hint="One or two sentences shown on the blog list and in Google results."
            >
              <textarea
                id="blog-excerpt"
                value={form.excerpt}
                onChange={(e) => updateForm("excerpt", e.target.value)}
                rows={2}
                maxLength={500}
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="Media">
            <Field label="Cover photo" hint="Landscape works best.">
              <ImageUpload
                currentUrl={form.coverImageUrl || null}
                shape="wide"
                onBusyChange={setUploading}
                onRemove={() => setForm((prev) => ({ ...prev, coverImageUrl: "", coverImagePublicId: "" }))}
                onUploaded={(url, publicId) => {
                  setForm((prev) => ({ ...prev, coverImageUrl: url, coverImagePublicId: publicId }));
                  setFormError(null);
                }}
              />
            </Field>
            <Field label="YouTube video" htmlFor="blog-youtube" hint="Optional — paste the link from YouTube’s Share button.">
              <input
                id="blog-youtube"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                value={form.youtubeUrl}
                onChange={(e) => updateForm("youtubeUrl", e.target.value)}
                placeholder="https://youtu.be/…"
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection title="Visibility">
            <Switch
              id="blog-published"
              label="Published"
              description={form.published ? "Visible on the website’s blog." : "Draft — only you can see it here."}
              checked={form.published}
              onChange={(v) => updateForm("published", v)}
            />
          </FormSection>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this post?"
        message="This can’t be undone. To just take it off the website, switch off “Published” instead."
        confirmLabel="Delete post"
        busy={saving}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
