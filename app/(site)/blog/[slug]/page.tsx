import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { getBlogPostBySlug } from "@/lib/queries";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import YouTubeEmbed from "@/components/YouTubeEmbed";

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

  return (
    <article className="bg-cream">
      <div className="aspect-[21/9] w-full overflow-hidden">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>

      <div className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-display">{post.title}</h1>
        {post.publishedAt && (
          <p className="mt-2 font-sans text-sm uppercase tracking-wide text-brown">
            {new Date(post.publishedAt).toLocaleDateString("en-ZA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {post.youtubeUrl && (
          <div className="mt-8">
            <YouTubeEmbed url={post.youtubeUrl} />
          </div>
        )}

        <div className="prose prose-neutral mt-8 max-w-none font-sans prose-headings:font-display prose-a:text-brown">
          <Markdown>{post.content}</Markdown>
        </div>
      </div>
    </article>
  );
}
