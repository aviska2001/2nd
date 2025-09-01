import PackingListGenerator from '../../components/PackingListGenerator';
import StructuredData from '../../components/StructuredData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Travel Packing List Generator: Personalized Checklists for Any Trip',
  description: 'Create customized packing lists instantly with our free AI travel tool. Input your destination, duration, activities, and Trip Type for smart recommendations. Pack smarter, travel stress-free – no sign-up required!',
  keywords: 'packing list generator, travel packing checklist, AI travel planner, free packing list, travel essentials, packing tips',
  openGraph: {
    title: 'Free AI Travel Packing List Generator: Personalized Checklists for Any Trip',
    description: 'Create customized packing lists instantly with our free AI travel tool. Input your destination, duration, activities, and Trip Type for smart recommendations. Pack smarter, travel stress-free – no sign-up required!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Travel Packing List Generator: Personalized Checklists for Any Trip',
    description: 'Create customized packing lists instantly with our free AI travel tool. Input your destination, duration, activities, and Trip Type for smart recommendations. Pack smarter, travel stress-free – no sign-up required!',
  },
};

export default function PackingListGeneratorPage() {
  return (
    <div className="min-h-screen">
      <StructuredData />
      
      {/* Main Generator Content */}
      <div id="generator" className="relative">
        <PackingListGenerator />
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Packing List Generator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Save time, reduce stress, and never forget essential items with our intelligent packing assistant
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Intelligence</h3>
              <p className="text-gray-600">Advanced algorithms analyze your destination, weather, and activities to suggest the perfect items</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Destinations</h3>
              <p className="text-gray-600">Comprehensive database covering destinations worldwide with local insights and requirements</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Results</h3>
              <p className="text-gray-600">Get your personalized packing list in seconds, not hours of manual planning</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Activity-Specific</h3>
              <p className="text-gray-600">Tailored recommendations based on your planned activities and trip type</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Friendly</h3>
              <p className="text-gray-600">Access your packing lists on any device, anywhere, anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works - Simple as 1-2-3
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Generate comprehensive packing lists in minutes with our streamlined process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enter Trip Details</h3>
              <p className="text-gray-600 text-lg">Tell us your destination, trip duration, season, and planned activities</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Generates List</h3>
              <p className="text-gray-600 text-lg">Our AI analyzes your inputs and creates a personalized packing checklist</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pack Smart & Travel</h3>
              <p className="text-gray-600 text-lg">Use your optimized list to pack efficiently and enjoy your trip stress-free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Travelers Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of smart travelers who never forget what to pack
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Packing Lists Generated</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Destinations Covered</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
