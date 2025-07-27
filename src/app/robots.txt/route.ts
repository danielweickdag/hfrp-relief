import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Block admin pages from being crawled
Disallow: /admin/

# Sitemap location
Sitemap: https://haitianfamilyrelief.org/sitemap.xml

# Crawl delay (optional - helps with server load)
Crawl-delay: 1`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
