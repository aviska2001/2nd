import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap - Smart Packing List Generator',
  description: 'Complete sitemap of the Smart Packing List Generator website with all available pages and sections.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SitemapPage() {
  const sections = [
    {
      title: 'Main Pages',
      links: [
        { href: '/', title: 'Home Page', description: 'Main landing page with packing list generator' },
        { href: '/#generator', title: 'Packing List Generator', description: 'Interactive tool to create custom packing lists' },
        { href: '/#features', title: 'Features Section', description: 'Learn about our smart features' },
        { href: '/#how', title: 'How It Works', description: 'Step-by-step guide on using the generator' },
      ]
    },
    {
      title: 'API Endpoints',
      links: [
        { href: '/api/generate-packing-list', title: 'Generate Packing List API', description: 'API endpoint for creating new packing lists' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website Sitemap
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Navigate through all available pages and sections of the Smart Packing List Generator
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-3">
                {section.title}
              </h2>
              <div className="grid gap-4">
                {section.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <Link 
                      href={link.href}
                      className="block group"
                    >
                      <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-800 mb-2">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {link.description}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Note about removed functionality */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📋 About Packing Lists
            </h3>
            <p className="text-gray-700">
              Our packing list generator creates personalized checklists based on your destination, activities, and trip details. 
              Lists are generated in real-time and displayed directly on the page.
            </p>
          </div>

          {/* Additional resources */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              🔗 Additional Resources
            </h3>
            <div className="space-y-2">
              <div>
                <strong>XML Sitemap:</strong> <Link href="/sitemap.xml" className="text-blue-600 hover:text-blue-800">/sitemap.xml</Link>
              </div>
              <div>
                <strong>Robots.txt:</strong> <Link href="/robots.txt" className="text-blue-600 hover:text-blue-800">/robots.txt</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
