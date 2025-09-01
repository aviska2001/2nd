const fs = require('fs');
const path = require('path');

function optimizeStaticPages() {
  try {
    console.log('⚡ Optimizing static pages for performance...');
    
    const staticDir = path.join(process.cwd(), 'static-pages');
    
    if (!fs.existsSync(staticDir)) {
      console.log('❌ Static pages directory not found. Run generate-static first.');
      return;
    }

    // Add performance optimizations to HTML files
    function optimizeHTML(htmlContent) {
      // Add preload hints for critical resources
      const preloadHints = `
    <link rel="preconnect" href="https://images.pexels.com">
    <link rel="dns-prefetch" href="https://images.pexels.com">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">`;
      
      // Add performance and accessibility meta tags
      const performanceMeta = `
    <meta name="theme-color" content="#3498db">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="format-detection" content="telephone=no">`;
      
      // Inject optimizations after <head>
      htmlContent = htmlContent.replace(
        '<head>',
        `<head>${preloadHints}${performanceMeta}`
      );
      
      // Add lazy loading to images
      htmlContent = htmlContent.replace(
        /<img([^>]*?)src=/g,
        '<img$1loading="lazy" decoding="async" src='
      );
      
      // Minify HTML (basic)
      htmlContent = htmlContent
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
      
      return htmlContent;
    }

    // Process index.html
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');
      indexContent = optimizeHTML(indexContent);
      fs.writeFileSync(indexPath, indexContent);
      console.log('✅ Optimized index.html');
    }

    // Process all itinerary pages
    const itinerariesDir = path.join(staticDir, 'saved-itinerary');
    if (fs.existsSync(itinerariesDir)) {
      const itineraryDirs = fs.readdirSync(itinerariesDir);
      
      for (const dir of itineraryDirs) {
        const htmlPath = path.join(itinerariesDir, dir, 'index.html');
        if (fs.existsSync(htmlPath)) {
          let htmlContent = fs.readFileSync(htmlPath, 'utf8');
          htmlContent = optimizeHTML(htmlContent);
          fs.writeFileSync(htmlPath, htmlContent);
        }
      }
      
      console.log(`✅ Optimized ${itineraryDirs.length} itinerary pages`);
    }

    // Create .htaccess for Apache servers (optional)
    const htaccess = `# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# Force HTTPS (uncomment if needed)
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Add security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`;

    fs.writeFileSync(path.join(staticDir, '.htaccess'), htaccess);
    console.log('✅ Created .htaccess file');

    // Create _headers file for Netlify
    const netlifyHeaders = `/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  
/*.html
  Cache-Control: public, max-age=3600
  
/*.css
  Cache-Control: public, max-age=31536000
  
/*.js
  Cache-Control: public, max-age=31536000
  
/*.png
  Cache-Control: public, max-age=31536000
  
/*.jpg
  Cache-Control: public, max-age=31536000
  
/*.jpeg
  Cache-Control: public, max-age=31536000
  
/*.webp
  Cache-Control: public, max-age=31536000`;

    fs.writeFileSync(path.join(staticDir, '_headers'), netlifyHeaders);
    console.log('✅ Created _headers file for Netlify');

    // Create netlify.toml for additional Netlify configuration
    const netlifyConfig = `[build]
  publish = "."

[[redirects]]
  from = "/saved-itinerary/:id"
  to = "/saved-itinerary/:id/"
  status = 301

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"`;

    fs.writeFileSync(path.join(staticDir, 'netlify.toml'), netlifyConfig);
    console.log('✅ Created netlify.toml file');

    console.log('🎉 Static page optimization completed!');
    console.log('📈 Performance improvements:');
    console.log('   • Minified HTML');
    console.log('   • Added lazy loading to images');
    console.log('   • Added preconnect hints');
    console.log('   • Created server configuration files');
    
  } catch (error) {
    console.error('❌ Error optimizing static pages:', error);
  }
}

optimizeStaticPages();
