import Link from "next/link";
import Image from "next/image";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
};

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col border border-taupe/30 bg-cream">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {post.coverImageUrl ? (
          <Image
            src={cld(post.coverImageUrl, "detail")}
            alt={post.title}
            fill
            sizes={IMG_SIZES.card}
            placeholder="blur"
            blurDataURL={cld(post.coverImageUrl, "blur")}
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-lg group-hover:text-brown">{post.title}</p>
        {post.excerpt && <p className="mt-2 font-sans text-sm text-ink/70">{post.excerpt}</p>}
        {post.publishedAt && (
          <p className="mt-auto pt-4 font-sans text-xs uppercase tracking-wide text-brown">
            {new Date(post.publishedAt).toLocaleDateString("en-ZA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
