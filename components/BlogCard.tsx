import Link from "next/link";
import Image from "next/image";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import { formatDate } from "@/lib/format-date";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

export default function BlogCard({
  post,
  index,
  sizes = IMG_SIZES.card,
}: {
  post: BlogPost;
  /** Optional running number shown as an editorial index ("No. 02"). */
  index?: number;
  sizes?: string;
}) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-sand">
          {post.coverImageUrl ? (
            <Image
              src={cld(post.coverImageUrl, "detail")}
              alt={post.title}
              fill
              sizes={sizes}
              placeholder="blur"
              blurDataURL={cld(post.coverImageUrl, "blur")}
              className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
        <div className="mt-5 flex items-center gap-3 label text-ink/65">
          {index !== undefined && <span className="tabular-nums">No. {String(index).padStart(2, "0")}</span>}
          {index !== undefined && post.publishedAt && <span aria-hidden="true">&middot;</span>}
          {post.publishedAt && <time dateTime={new Date(post.publishedAt).toISOString()}>{formatDate(post.publishedAt)}</time>}
        </div>
        <h3 className="mt-3 font-display text-2xl leading-tight transition-colors group-hover:text-brown">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-ink/70">{post.excerpt}</p>
        )}
        <span className="label mt-4 inline-block border-b border-ink/40 pb-1 group-hover:border-ink">
          Read the story
        </span>
      </Link>
    </article>
  );
}
