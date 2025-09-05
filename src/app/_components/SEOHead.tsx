import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
}

export default function SEOHead({
  title = "Haitian Family Relief Project - Fighting Hunger, Providing Hope",
  description = "Join us in our mission to feed and empower Haitian orphans. Make a lasting difference with daily giving - as little as 16¢ can provide meals, shelter, education, and healthcare.",
  keywords = "Haiti, orphans, charity, donation, relief, hunger, children, nonprofit, giving, hope, daily giving, Haitian Family Relief Project",
  image = "/hfrp-logo.png",
  url = "https://haitianfamilyrelief.org",
  type = "website",
  article,
}: SEOHeadProps) {
  const fullTitle = title.includes("Haitian Family Relief")
    ? title
    : `${title} | Haitian Family Relief Project`;
  const fullImage = image.startsWith("http") ? image : `${url}${image}`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Haitian Family Relief Project" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific meta tags */}
      {article && type === "article" && (
        <>
          <meta property="article:author" content={article.author} />
          <meta
            property="article:published_time"
            content={article.publishedTime}
          />
          <meta
            property="article:modified_time"
            content={article.modifiedTime}
          />
          <meta property="article:section" content={article.section} />
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:creator" content="@hfrproject" />
      <meta property="twitter:site" content="@hfrproject" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Haitian Family Relief Project" />
      <meta name="theme-color" content="#dc2626" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/png" href="/hfrp-logo.png" />
      <link rel="apple-touch-icon" href="/hfrp-logo.png" />

      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Haitian Family Relief Project",
          description: description,
          url: url,
          logo: fullImage,
          sameAs: [
            "https://facebook.com/haitianfamilyreliefproject",
            "https://instagram.com/haitianfamilyreliefproject",
            "https://twitter.com/hfrproject",
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "donations",
            url: `${url}/donate`,
          },
          foundingDate: "2020",
          location: {
            "@type": "Place",
            name: "Haiti",
          },
          seeks: {
            "@type": "Demand",
            name: "Donations for Haitian orphan care",
          },
        })}
      </script>
    </Head>
  );
}
