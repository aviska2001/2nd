import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml

# Crawl-delay for respect
Crawl-delay: 1

# Allow important SEO pages
Allow: /packing-list/
Allow: /free-packing-list-generator
Allow: /free-travel-planner-ai
Allow: /saved-lists
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
