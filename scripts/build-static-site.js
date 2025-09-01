const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildStaticSite() {
  try {
    console.log('🚀 Building static site for saved itineraries...');
    
    // First, update Next.js config for static export
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Temporarily modify config for static export
    const originalConfig = nextConfig;
    
    // Add static export configuration
    nextConfig = nextConfig.replace(
      'const nextConfig: NextConfig = {',
      `const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,`
    );
    
    // Modify images config for static export
    nextConfig = nextConfig.replace(
      'images: {',
      `images: {
    unoptimized: true,`
    );
    
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('📝 Updated Next.js config for static export');
    
    try {
      // Build the static site
      console.log('🔨 Building static site...');
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('✅ Static site built successfully!');
      console.log('📁 Static files are in the "out" directory');
      
      // Copy static files to a dedicated directory
      const staticDir = path.join(process.cwd(), 'static-site');
      const outDir = path.join(process.cwd(), 'out');
      
      if (fs.existsSync(staticDir)) {
        fs.rmSync(staticDir, { recursive: true, force: true });
      }
      
      if (fs.existsSync(outDir)) {
        fs.cpSync(outDir, staticDir, { recursive: true });
        console.log('📋 Copied static files to static-site directory');
      }
      
    } catch (buildError) {
      console.error('❌ Build failed:', buildError.message);
    } finally {
      // Restore original config
      fs.writeFileSync(nextConfigPath, originalConfig);
      console.log('🔄 Restored original Next.js config');
    }
    
  } catch (error) {
    console.error('❌ Error building static site:', error);
  }
}

buildStaticSite().catch(console.error);
