import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/queries";
import { cld } from "@/lib/cloudinary-url";
import { formatDate } from "@/lib/format-date";
import BlogCard from "@/components/BlogCard";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      url: `/blog/${slug}`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const more = (await getPublishedBlogPosts()).filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <>
      <article className="bg-cream">
        <header className="shell pb-12 pt-14 text-center sm:pt-20">
          <nav aria-label="Breadcrumb" className="label text-ink/65">
            <Link href="/blog" className="hover:text-ink">
              &larr; The Journal
            </Link>
          </nav>
          {post.publishedAt && (
            <p className="label mt-10 text-gold-deep">
              <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>
            </p>
          )}
          <h1 className="mx-auto mt-6 max-w-4xl text-display">{post.title}</h1>
          {post.excerpt && (
            <p className="mx-auto mt-8 max-w-2xl font-display text-lede font-light italic text-ink/80">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.coverImageUrl && (
          <div className="shell">
            <div className="relative aspect-[16/10] overflow-hidden bg-sand">
              <Image
                src={cld(post.coverImageUrl, "wide")}
                alt={post.title}
                fill
                preload
                sizes="(max-width: 1440px) 100vw, 90rem"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
          {post.youtubeUrl && (
            <div className="mb-12">
              <YouTubeEmbed url={post.youtubeUrl} />
            </div>
          )}

          <div className="dropcap prose prose-neutral max-w-none font-sans text-[1.0625rem] leading-[1.8] prose-headings:font-display prose-headings:font-normal prose-h2:text-4xl prose-h3:text-2xl prose-a:text-brown prose-blockquote:border-gold-deep prose-blockquote:font-display prose-blockquote:text-2xl prose-blockquote:font-light prose-strong:text-ink prose-img:w-full">
            <Markdown>{post.content}</Markdown>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-ink/15 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-2xl">
              Inspired? <span className="italic">Let&apos;s make yours.</span>
            </p>
            <ButtonLink href="/products">Shop the Collection</ButtonLink>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-journal" className="border-t border-ink/10 bg-sand py-20 sm:py-28">
          <div className="shell">
            <h2 id="more-journal" className="text-section">
              More from <span className="italic">the Journal</span>
            </h2>
            <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2">
              {more.map((p) => (
                <BlogCard key={p.id} post={p} sizes="(max-width: 640px) 100vw, 50vw" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
