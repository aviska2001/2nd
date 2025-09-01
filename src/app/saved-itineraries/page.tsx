'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StructuredData from '../../components/StructuredData';
// Using built-in date formatting for now

interface Activity {
  activity: string;
  details: string;
}

interface DayItinerary {
  day: string;
  location: string;
  google_map_url: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  travel_tip: string;
}

interface SavedItinerary {
  id: string;
  title: string;
  destination: string;
  days: string;
  budget: string;
  travelCompanions: string;
  interests: string;
  itinerary: DayItinerary[];
  destinationImage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SavedItinerariesPage() {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedItineraries();
  }, []);

  useEffect(() => {
    // Update page title based on the number of saved itineraries
    if (!loading && savedItineraries.length > 0) {
      document.title = `${savedItineraries.length} Saved Itineraries | AI Travel Planner`;
    }
  }, [savedItineraries, loading]);

  useEffect(() => {
    loadSavedItineraries();
  }, []);

  const loadSavedItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-all-itineraries');
      
      if (!response.ok) {
        throw new Error('Failed to load saved itineraries');
      }
      
      const data = await response.json();
      setSavedItineraries(data);
    } catch (error) {
      console.error('Error loading saved itineraries:', error);
      setError('Failed to load saved itineraries');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetEmoji = (budget: string) => {
    if (budget.includes('Budget-friendly')) return '🏠';
    if (budget.includes('Mid-range')) return '🏨';
    if (budget.includes('Luxury')) return '✨';
    if (budget.includes('Ultra-luxury')) return '👑';
    return '💰';
  };

  const getCompanionEmoji = (companion: string) => {
    if (companion.includes('solo')) return '🚶';
    if (companion.includes('couple')) return '💑';
    if (companion.includes('family')) return '👨‍👩‍👧‍👦';
    if (companion.includes('friends')) return '👫';
    if (companion.includes('business')) return '💼';
    return '👥';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your saved trips...</h2>
            <div className="animate-pulse text-gray-600">Please wait</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadSavedItineraries}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <StructuredData 
        type="WebApplication"
        name="Saved Travel Itineraries | AI Trip Planner"
        description="Access and manage your saved AI-generated travel itineraries. View detailed trip plans, destinations, activities, and travel tips for your upcoming adventures."
        url="https://your-domain.com/saved-itineraries"
      />
      
      {/* Additional structured data for the collection page */}
      {!loading && savedItineraries.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Saved Travel Itineraries",
              "description": "Your personal collection of AI-generated travel itineraries and trip plans",
              "url": "https://your-domain.com/saved-itineraries",
              "mainEntity": {
                "@type": "ItemList",
                "name": "Saved Travel Itineraries",
                "description": "Collection of personalized travel itineraries",
                "numberOfItems": savedItineraries.length,
                "itemListElement": savedItineraries.slice(0, 5).map((itinerary, index) => ({
                  "@type": "TouristTrip",
                  "position": index + 1,
                  "name": itinerary.title,
                  "description": `${itinerary.days}-day trip to ${itinerary.destination}`,
                  "url": `https://your-domain.com/saved-itinerary/${itinerary.id}`,
                  "touristType": itinerary.travelCompanions,
                  "locationCreated": {
                    "@type": "Place",
                    "name": itinerary.destination
                  },
                  "temporalCoverage": `P${itinerary.days}D`,
                  "dateCreated": itinerary.createdAt,
                  "about": itinerary.interests.split(',').slice(0, 3).map(interest => ({
                    "@type": "Thing",
                    "name": interest.trim()
                  }))
                }))
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://your-domain.com"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Saved Itineraries",
                    "item": "https://your-domain.com/saved-itineraries"
                  }
                ]
              },
              "isPartOf": {
                "@type": "WebSite",
                "name": "AI Travel Planner",
                "url": "https://your-domain.com"
              }
            })
          }}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="mr-3">🗺️</span>
              Saved Itineraries
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Your collection of amazing travel plans
            </p>
            
            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/free-travel-planner-ai"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                <span className="mr-2">✈️</span>
                Create New Trip
              </Link>
              <Link
                href="/free-packing-list-generator"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <span className="mr-2">🎒</span>
                Packing List Generator
              </Link>
              <Link
                href="/saved-packing-lists"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg"
              >
                <span className="mr-2">📋</span>
                Saved Packing Lists
              </Link>
            </div>
          </div>

          {/* Saved Itineraries Grid */}
          {savedItineraries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-6">🏝️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No saved itineraries yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start planning your next adventure! Create your first itinerary and save it for later.
              </p>
              <Link
                href="/free-travel-planner-ai"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg transform hover:-translate-y-1"
              >
                <span className="mr-2">✈️</span>
                Plan Your First Trip
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItineraries.map((itinerary) => (
                <div key={itinerary.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600">
                    {itinerary.destinationImage ? (
                      <Image
                        src={itinerary.destinationImage}
                        alt={itinerary.destination}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl text-white">🌍</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold leading-tight overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>{itinerary.title}</h3>
                      <p className="text-sm opacity-90 mt-1">{itinerary.destination}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Trip Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <span className="text-lg mr-2">📅</span>
                        <span className="text-gray-700">{itinerary.days} day{itinerary.days !== '1' ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-lg mr-2">{getBudgetEmoji(itinerary.budget)}</span>
                        <span className="text-gray-700">{itinerary.budget.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-lg mr-2">{getCompanionEmoji(itinerary.travelCompanions)}</span>
                        <span className="text-gray-700 capitalize">{itinerary.travelCompanions}</span>
                      </div>
                    </div>

                    {/* Interests Tags */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {itinerary.interests.split(',').slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {interest.trim()}
                          </span>
                        ))}
                        {itinerary.interests.split(',').length > 3 && (
                          <span className="text-xs text-blue-600">
                            +{itinerary.interests.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Saved {new Date(itinerary.createdAt).toLocaleDateString()}
                      </div>
                      <Link
                        href={`/saved-itinerary/${itinerary.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        View Trip
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {savedItineraries.length > 0 && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-white rounded-xl shadow-lg">
                <span className="text-2xl mr-3">📊</span>
                <span className="text-gray-700 font-medium">
                  You have {savedItineraries.length} saved itinerar{savedItineraries.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
