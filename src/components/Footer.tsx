import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Smart Packing List Generator
            </h3>
            <p className="text-gray-400 text-sm">
              AI-powered travel companion that creates personalized packing lists for your perfect trip.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#generator" className="text-gray-400 hover:text-white transition-colors">
                  Generator
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/sitemap-page" className="text-gray-400 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-gray-400 hover:text-white transition-colors">
                  XML Sitemap
                </Link>
              </li>
              <li>
                <Link href="/robots.txt" className="text-gray-400 hover:text-white transition-colors">
                  Robots.txt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Smart Packing List Generator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
