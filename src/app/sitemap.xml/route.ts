import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl = "https://haitianfamilyrelief.org";

  // Static pages
  const staticPages = [
    "",
    "/about",
    "/blog",
    "/donate",
    "/membership",
    "/contact",
    "/programs",
    "/programs/feeding",
    "/programs/shelter",
    "/programs/healthcare",
    "/programs/education",
  ];

  // Blog posts (you would typically fetch these from your CMS/database)
  const blogPosts = [
    "sample-post",
    "welcomed-30-new-children",
    "monthly-medical-clinic",
    "education-program-expansion",
    "emergency-food-distribution",
  ];

  const currentDate = new Date().toISOString();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page === "" ? "daily" : page === "/blog" ? "weekly" : "monthly"}</changefreq>
    <priority>${page === "" ? "1.0" : page === "/donate" ? "0.9" : "0.8"}</priority>
  </url>`,
    )
    .join("")}
  ${blogPosts
    .map(
      (slug) => `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
