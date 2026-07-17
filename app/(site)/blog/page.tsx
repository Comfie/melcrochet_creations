import type { Metadata } from "next";
import { getPublishedBlogPosts } from "@/lib/queries";
import BlogCard from "@/components/BlogCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips on crochet care, size guides and behind-the-scenes stories from MelCrochet Gifted Hands.",
};

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-display">From the Workbench</h1>
        <p className="mt-3 max-w-2xl font-sans text-ink/70">
          Stories, behind-the-scenes process, and the occasional video from the
          MelCrochet studio.
        </p>

        {posts.length === 0 ? (
          <p className="mt-16 font-sans text-ink/70">New stories are on their way — check back soon.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
