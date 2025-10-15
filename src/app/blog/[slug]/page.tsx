import Image from "next/image";
import BackButton from "./BackButton";
import { getPostBySlug, getPosts, type BlogPost } from "../posts";

// Map BlogPost to the BackButton's expected PostData shape
type BackButtonPostData = { [key: string]: string; content: string };
function toPostData(p: BlogPost): BackButtonPostData {
  return {
    title: p.title,
    summary: p.summary ?? "",
    content: p.content,
    author: p.author ?? "",
    image: p.image ?? "",
    date: p.date,
  };
}

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Haitian Family Relief Project",
    };
  }

  return {
    title: `${post.title} | Haitian Family Relief Project`,
    description:
      post.summary ||
      `Read ${post.title} - a story from the Haitian Family Relief Project`,
    keywords: `${post.title}, Haiti, relief, orphans, story, ${post.author || "HFRP"}`,
    openGraph: {
      title: `${post.title} | Haitian Family Relief Project`,
      description:
        post.summary ||
        `Read ${post.title} - a story from the Haitian Family Relief Project`,
      type: "article",
      url: `https://www.familyreliefproject7.org/blog/${slug}`,
    images: post.image
      ? [`https://www.familyreliefproject7.org${post.image}`]
        : [],
      article: {
        authors: [post.author || "HFRP Team"],
        publishedTime: post.date,
        section: "Stories & Updates",
        tags: ["Haiti", "Relief", "Orphans"],
      },
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Haitian Family Relief Project`,
      description:
        post.summary ||
        `Read ${post.title} - a story from the Haitian Family Relief Project`,
      images: post.image
        ? [`https://www.familyreliefproject7.org${post.image}`]
        : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const post = getPostBySlug(slug);

  if (!post) return <div className="py-10 text-center">Post not found</div>;

  return (
    <article className="max-w-2xl mx-auto py-10 px-4 bg-white/90 shadow-xl rounded-xl border mt-5">
      <BackButton post={toPostData(post)} />
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <div className="mb-4 text-xs text-zinc-500 flex gap-2">
        <span>{new Date(post.date).toLocaleDateString()}</span>
        {post.author && <span>· By {post.author}</span>}
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt={post.title}
          width={580}
          height={290}
          className="rounded-lg mb-4 object-cover w-full h-56"
        />
      )}
      <div
        className="prose max-w-none text-zinc-800"
        style={{ whiteSpace: "pre-line" }}
      >
        {post.content}
      </div>
    </article>
  );
}
