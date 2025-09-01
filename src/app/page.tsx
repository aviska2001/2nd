import StructuredData from '../components/StructuredData';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <StructuredData />
      
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Smart Packing Made Simple
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
          AI-powered packing lists for every destination and trip type
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/free-packing-list-generator"
            className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2"
          >
            <span className="mr-3">🧳</span>
            Packing List Generator
            <span className="ml-3">→</span>
          </Link>
          
          <Link
            href="/free-travel-planner-ai"
            className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold text-xl rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2"
          >
            <span className="mr-3">✈️</span>
            AI Trip Planner
            <span className="ml-3">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
