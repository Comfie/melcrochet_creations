import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { getPublishedBlogPosts } from "@/lib/queries";
import { cld } from "@/lib/cloudinary-url";
import { formatDate } from "@/lib/format-date";
import BlogCard from "@/components/BlogCard";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Journal — Crochet Stories, Care & Styling",
  description:
    "The MelCrochet journal — handmade crochet stories, care, styling, gifting and behind-the-scenes videos from MelCrochet Gifted Hands in South Africa.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <section className="bg-cream">
        <div className="shell pb-14 pt-14 sm:pb-20 sm:pt-20">
          <div className="grid gap-8 border-b border-ink pb-10 lg:grid-cols-12 lg:items-end">
            <h1 className="text-mega lg:col-span-8">
              The <span className="italic">Journal</span>
            </h1>
            <p className="max-w-sm font-sans leading-relaxed text-ink/70 lg:col-span-4">
              Stories from the workbench — collections, craftsmanship, styling,
              gifting and the occasional video from the MelCrochet studio.
            </p>
          </div>

          {!lead && (
            <p className="py-24 text-center font-display text-section">
              New stories are on their way — <span className="italic">check back soon.</span>
            </p>
          )}

          {lead && (
            <article className="group mt-14 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16">
              <Link href={`/blog/${lead.slug}`} className="block lg:col-span-7" tabIndex={-1} aria-hidden="true">
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  {lead.coverImageUrl ? (
                    <Image
                      src={cld(lead.coverImageUrl, "wide")}
                      alt=""
                      fill
                      preload
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <ImagePlaceholder className="h-full w-full" />
                  )}
                </div>
              </Link>
              <div className="lg:col-span-5">
                <p className="label flex items-center gap-3 text-gold-deep">
                  <span>Latest Story</span>
                  {lead.publishedAt && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <time dateTime={new Date(lead.publishedAt).toISOString()} className="text-ink/65">
                        {formatDate(lead.publishedAt)}
                      </time>
                    </>
                  )}
                </p>
                <h2 className="mt-5 text-section">
                  <Link href={`/blog/${lead.slug}`} className="hover:text-brown">
                    {lead.title}
                  </Link>
                </h2>
                {lead.excerpt && (
                  <p className="mt-5 font-sans leading-relaxed text-ink/70">{lead.excerpt}</p>
                )}
                <Link
                  href={`/blog/${lead.slug}`}
                  className="label mt-8 inline-block border-b border-ink pb-1 hover:text-brown"
                >
                  Read the story
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>

      {rest.length > 0 && (
        <section aria-labelledby="more-stories" className="border-t border-ink/10 bg-cream py-20 sm:py-28">
          <div className="shell">
            <h2 id="more-stories" className="label text-gold-deep">
              More Stories
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i + 2} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
