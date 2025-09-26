import Image from "next/image";
import BackButton from "./BackButton";

interface PostData {
  [key: string]: string;
  content: string;
}

function parseMarkdownPost(md: string): PostData | null {
  const match = md.match(/^---\n([\s\S]+?)---\n([\s\S]*)$/);
  if (!match) return null;
  const metaLines = match[1].split("\n");
  const data: { [key: string]: string } = {};
  for (const l of metaLines) {
    const [key, ...rest] = l.split(":");
    if (key && rest.length)
      data[key.trim()] = rest
        .join(":")
        .trim()
        .replace(/^\"|\"$/g, "");
  }
  return {
    ...data,
    content: match[2],
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  // For now, we only have one blog post
  return [{ slug: "sample-post" }];
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

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
    url: `https://www.familyreliefproject.org/blog/${slug}`,
        images: post.image
          ? [`https://www.familyreliefproject.org${post.image}`]
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
          ? [`https://www.familyreliefproject.org${post.image}`]
          : [],
    },
  };
}

async function fetchPost(slug: string) {
  if (slug === "sample-post") {
    return parseMarkdownPost(
      `---\ntitle: \"Welcome to Our New Blog!\"\ndate: \"2024-05-13\"\nauthor: \"HFRP Team\"\nsummary: \"A new space for our community to share stories, news, and inspiration.\"\nimage: \"/uploads/LOGO.jpg\"\n---\n\nWe're excited to launch our new blog! Here you'll find stories of impact, updates from the field, successes, and ways you can help. Stay tuned for more inspiring news from the Haitian Family Relief Project!\n`
    );
  }
  return null;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  if (!post) return <div className="py-10 text-center">Post not found</div>;

  return (
    <article className="max-w-2xl mx-auto py-10 px-4 bg-white/90 shadow-xl rounded-xl border mt-5">
      <BackButton post={post} />
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
