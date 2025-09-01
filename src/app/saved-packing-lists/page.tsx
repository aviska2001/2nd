'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PackingItem {
  item: string;
  quantity: string;
  description: string;
  priority: 'essential' | 'recommended' | 'optional';
}

interface PackingList {
  clothing: PackingItem[];
  toiletries: PackingItem[];
  electronics: PackingItem[];
  documents: PackingItem[];
  health_safety: PackingItem[];
  activity_specific: PackingItem[];
  miscellaneous: PackingItem[];
}

interface DestinationDetails {
  overview: string;
  best_time_to_visit: string;
  weather_summary: string;
  cultural_tips: string;
  local_transport: string;
  currency: string;
  language: string;
  power_plugs: string;
  safety_tips: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SavedPackingList {
  id: string;
  title: string;
  destination: string;
  days: string;
  season: string;
  trip_type: string;
  activities: string;
  packing_list: PackingList;
  packing_tips: string[];
  destination_notes: string;
  destination_details?: DestinationDetails;
  faqs?: FAQItem[];
  destination_image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SavedPackingListsPage() {
  const [savedPackingLists, setSavedPackingLists] = useState<SavedPackingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSavedPackingLists();
  }, []);

  const loadSavedPackingLists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-all-packing-lists');
      
      if (!response.ok) {
        throw new Error('Failed to load saved packing lists');
      }
      
      const data = await response.json();
      setSavedPackingLists(data);
    } catch (error) {
      console.error('Error loading saved packing lists:', error);
      setError('Failed to load saved packing lists');
    } finally {
      setLoading(false);
    }
  };

  const getSeasonEmoji = (season: string) => {
    switch (season.toLowerCase()) {
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'autumn': return '🍂';
      case 'winter': return '❄️';
      default: return '🌤️';
    }
  };

  const getTripTypeEmoji = (tripType: string) => {
    switch (tripType.toLowerCase()) {
      case 'leisure': return '🏖️';
      case 'business': return '💼';
      case 'adventure': return '🏔️';
      case 'cultural': return '🏛️';
      case 'romantic': return '💕';
      case 'family': return '👨‍👩‍👧‍👦';
      default: return '✈️';
    }
  };

  const getTotalItems = (packingList: PackingList) => {
    return Object.values(packingList).reduce((total, category) => total + category.length, 0);
  };

  const getEssentialItems = (packingList: PackingList) => {
    return Object.values(packingList).reduce((total, category) => 
      total + category.filter((item: PackingItem) => item.priority === 'essential').length, 0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">🎒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your saved packing lists...</h2>
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
              onClick={loadSavedPackingLists}
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
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Saved Packing Lists Collection",
            "description": "Collection of personalized AI-generated travel packing lists for various destinations, trip types, and activities",
            "url": typeof window !== 'undefined' ? window.location.href : '',
            "mainEntity": {
              "@type": "ItemList",
              "name": "Travel Packing Lists",
              "description": "Saved travel packing checklists for different destinations and trip types",
              "numberOfItems": savedPackingLists.length,
              "itemListElement": savedPackingLists.map((list, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "ChecklistDocument",
                  "name": `${list.days}-Day ${list.trip_type.charAt(0).toUpperCase() + list.trip_type.slice(1)} Packing List for ${list.destination} - ${list.season.charAt(0).toUpperCase() + list.season.slice(1)}`,
                  "description": `Complete ${list.days}-day ${list.trip_type} packing checklist for ${list.destination} during ${list.season} season`,
                  "about": `${list.trip_type} trip to ${list.destination}`,
                  "keywords": `${list.destination}, ${list.trip_type}, ${list.season}, ${list.activities}`,
                  "dateCreated": list.createdAt,
                  "dateModified": list.updatedAt
                }
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": typeof window !== 'undefined' ? window.location.origin : ''
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Saved Packing Lists",
                  "item": typeof window !== 'undefined' ? window.location.href : ''
                }
              ]
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="mr-3">🎒</span>
                Saved Packing Lists
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Your collection of smart packing checklists for destinations worldwide. 
                {savedPackingLists.length > 0 && (
                  <span className="block mt-2 text-lg">
                    Manage {savedPackingLists.length} personalized packing list{savedPackingLists.length === 1 ? '' : 's'} 
                    for various destinations, trip types, and activities.
                  </span>
                )}
              </p>
            
            {/* Navigation Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/free-packing-list-generator"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <span className="mr-2">📋</span>
                Create New Packing List
              </Link>
              <Link
                href="/free-travel-planner-ai"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                <span className="mr-2">✈️</span>
                Travel Planner
              </Link>
              <Link
                href="/saved-itineraries"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg"
              >
                <span className="mr-2">🗺️</span>
                Saved Itineraries
              </Link>
            </div>
          </div>

          {/* Saved Packing Lists Grid */}
          {savedPackingLists.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-6">🧳</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No saved packing lists yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create your first AI-powered packing list and it will be automatically saved here for easy access later. 
                Our smart generator creates personalized checklists based on your destination, trip duration, activities, and season.
              </p>
              <Link
                href="/free-packing-list-generator"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-bold shadow-lg transform hover:-translate-y-1"
              >
                <span className="mr-2">📋</span>
                Create Your First Packing List
              </Link>
              
              {/* SEO Content for Empty State */}
              <div className="mt-12 max-w-4xl mx-auto text-left bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why Save Your Packing Lists?</h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🎯 Personalized for Each Trip</h4>
                    <p>Each saved list is tailored to your specific destination, trip duration, activities, and travel companions.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🌍 Destination-Specific</h4>
                    <p>Get recommendations based on climate, culture, and local conditions for any destination worldwide.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📋 Reusable Templates</h4>
                    <p>Save time on future trips by reusing and adapting your previous packing lists.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">🤖 AI-Powered</h4>
                    <p>Our AI considers weather, activities, trip type, and destination specifics for smart recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* SEO-Enhanced Description for Active Lists */}
              <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Your Travel Packing Collection</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Browse your {savedPackingLists.length} saved packing lists below. Each list is specifically crafted 
                  for different destinations, trip types, and activities. Click on any list to view detailed recommendations, 
                  including essential items, activity-specific gear, and destination-specific advice.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{savedPackingLists.map((packingList) => (
                <div key={packingList.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-600">
                    {packingList.destination_image ? (
                      <Image
                        src={packingList.destination_image}
                        alt={packingList.destination}
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
                      }}>
                        {packingList.days}-Day {packingList.trip_type.charAt(0).toUpperCase() + packingList.trip_type.slice(1)} Packing List for {packingList.destination} - {packingList.season.charAt(0).toUpperCase() + packingList.season.slice(1)}
                      </h3>
                      <p className="text-sm opacity-90 mt-1">{packingList.trip_type.charAt(0).toUpperCase() + packingList.trip_type.slice(1)} Trip</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Trip Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm">
                        <span className="text-lg mr-2">📅</span>
                        <span className="text-gray-700">{packingList.days} day{packingList.days !== '1' ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-lg mr-2">{getSeasonEmoji(packingList.season)}</span>
                        <span className="text-gray-700 capitalize">{packingList.season}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-lg mr-2">{getTripTypeEmoji(packingList.trip_type)}</span>
                        <span className="text-gray-700 capitalize">{packingList.trip_type}</span>
                      </div>
                    </div>

                    {/* Packing Stats */}
                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-blue-600">{getTotalItems(packingList.packing_list)}</div>
                          <div className="text-xs text-blue-700">Total Items</div>
                        </div>
                        <div className="text-center bg-red-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-red-600">{getEssentialItems(packingList.packing_list)}</div>
                          <div className="text-xs text-red-700">Essential</div>
                        </div>
                      </div>
                    </div>

                    {/* Activities Tags */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {packingList.activities.split(',').slice(0, 3).map((activity, index) => (
                          <span
                            key={index}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {activity.trim()}
                          </span>
                        ))}
                        {packingList.activities.split(',').length > 3 && (
                          <span className="text-xs text-green-600">
                            +{packingList.activities.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Saved {new Date(packingList.createdAt).toLocaleDateString()}
                      </div>
                      <Link
                        href={`/saved-packing-list/${packingList.id}`}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        View List
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </>
          )}

          {/* Stats */}
          {savedPackingLists.length > 0 && (
            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-6 py-3 bg-white rounded-xl shadow-lg">
                <span className="text-2xl mr-3">📊</span>
                <span className="text-gray-700 font-medium">
                  You have {savedPackingLists.length} saved packing list{savedPackingLists.length === 1 ? '' : 's'}
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
