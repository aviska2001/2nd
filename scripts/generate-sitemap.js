const fs = require('fs');
const path = require('path');

function generateSitemap() {
  try {
    console.log('🗺️ Generating sitemap for static pages...');
    
    // Read saved itineraries
    const itinerariesPath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    let savedItineraries = [];
    
    if (fs.existsSync(itinerariesPath)) {
      const data = fs.readFileSync(itinerariesPath, 'utf8');
      savedItineraries = JSON.parse(data);
    }
    
    // Read saved packing lists
    const packingListsPath = path.join(process.cwd(), 'user-data', 'packing-lists', 'saved-packing-lists.json');
    let savedPackingLists = [];
    
    if (fs.existsSync(packingListsPath)) {
      const data = fs.readFileSync(packingListsPath, 'utf8');
      savedPackingLists = JSON.parse(data);
    }
    
    // Base URL - update this to your actual domain
    const baseUrl = 'https://yourdomain.com';
    
    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/saved-itineraries/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/saved-packing-lists/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${savedItineraries.map(itinerary => `  <url>
    <loc>${baseUrl}/saved-itinerary/${itinerary.id}/</loc>
    <lastmod>${new Date(itinerary.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
${savedPackingLists.map(packingList => `  <url>
    <loc>${baseUrl}/saved-packing-list/${packingList.id}/</loc>
    <lastmod>${new Date(packingList.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Save sitemap to static-pages directory
    const staticDir = path.join(process.cwd(), 'static-pages');
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(staticDir, 'sitemap.xml'), sitemap);
    
    // Also generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
    
    fs.writeFileSync(path.join(staticDir, 'robots.txt'), robotsTxt);
    
    console.log('✅ Sitemap and robots.txt generated successfully!');
    console.log(`📄 ${savedItineraries.length} itinerary pages and ${savedPackingLists.length} packing list pages included in sitemap`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

generateSitemap();
