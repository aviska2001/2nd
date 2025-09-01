'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
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

interface PackingResponse {
  packing_list: PackingList;
  packing_tips: string[];
  destination_notes: string;
  destination_details?: DestinationDetails;
  faqs?: FAQItem[];
}

interface ApiResponse {
  packing_data: PackingResponse;
  destination_image: string | null;
  usedStrategy?: 'ai+rules' | 'rules-only' | 'sample-fallback';
}

const PackingListGenerator = () => {
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    season: 'summer',
    trip_type: 'leisure',
    activities: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showActivitiesPopup, setShowActivitiesPopup] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [autoSaved, setAutoSaved] = useState(false);

  // Predefined activities list
  const activityOptions = [
    { id: 'sightseeing', label: '🏛️ Sightseeing', category: 'Culture' },
    { id: 'hiking', label: '🥾 Hiking', category: 'Adventure' },
    { id: 'beach', label: '🏖️ Beach Activities', category: 'Leisure' },
    { id: 'museums', label: '🏛️ Museums', category: 'Culture' },
    { id: 'restaurants', label: '🍽️ Dining', category: 'Food' },
    { id: 'shopping', label: '🛍️ Shopping', category: 'Leisure' },
    { id: 'nightlife', label: '🌃 Nightlife', category: 'Entertainment' },
    { id: 'photography', label: '📸 Photography', category: 'Creative' },
    { id: 'swimming', label: '🏊‍♂️ Swimming', category: 'Water Sports' },
    { id: 'diving', label: '🤿 Diving/Snorkeling', category: 'Water Sports' },
    { id: 'skiing', label: '⛷️ Skiing', category: 'Winter Sports' },
    { id: 'snowboarding', label: '🏂 Snowboarding', category: 'Winter Sports' },
    { id: 'cycling', label: '🚴‍♂️ Cycling', category: 'Adventure' },
    { id: 'climbing', label: '🧗‍♂️ Rock Climbing', category: 'Adventure' },
    { id: 'camping', label: '🏕️ Camping', category: 'Adventure' },
    { id: 'fishing', label: '🎣 Fishing', category: 'Leisure' },
    { id: 'golf', label: '⛳ Golf', category: 'Sports' },
    { id: 'spa', label: '🧘‍♀️ Spa/Wellness', category: 'Wellness' },
    { id: 'concerts', label: '🎵 Concerts/Shows', category: 'Entertainment' },
    { id: 'festivals', label: '🎉 Festivals', category: 'Entertainment' },
    { id: 'wildlife', label: '🦁 Wildlife Watching', category: 'Nature' },
    { id: 'boating', label: '⛵ Boating', category: 'Water Sports' },
    { id: 'business', label: '💼 Business Meetings', category: 'Business' },
    { id: 'conferences', label: '🎤 Conferences', category: 'Business' },
    { id: 'parks', label: '🌳 National Parks', category: 'Nature' },
    { id: 'food-tours', label: '🍕 Food Tours', category: 'Food' },
    { id: 'wine-tasting', label: '🍷 Wine Tasting', category: 'Food' },
    { id: 'markets', label: '🏪 Local Markets', category: 'Culture' },
    { id: 'temples', label: '⛩️ Temples/Churches', category: 'Culture' },
    { id: 'walking-tours', label: '🚶‍♂️ Walking Tours', category: 'Culture' }
  ];

  // Group activities by category
  const activityCategories = activityOptions.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<string, typeof activityOptions>);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev => {
      const isSelected = prev.includes(activityId);
      const newActivities = isSelected 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId];
      
      // Update form data with selected activities
      const activityLabels = newActivities.map(id => 
        activityOptions.find(option => option.id === id)?.label.replace(/^.+?\s/, '') // Remove emoji
      ).join(', ');
      
      setFormData(current => ({
        ...current,
        activities: activityLabels
      }));
      
      return newActivities;
    });
  };

  const openActivitiesPopup = () => {
    setShowActivitiesPopup(true);
  };

  const closeActivitiesPopup = () => {
    setShowActivitiesPopup(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setAutoSaved(false);

    try {
      const response = await fetch('/api/generate-packing-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // If no FAQs, generate 5 destination-related FAQs
        let enrichedData = data.data;
        if (!enrichedData.packing_data.faqs || enrichedData.packing_data.faqs.length < 5) {
          const destination = formData.destination;
          const faqs: FAQItem[] = [
            {
              question: `What is the best time to visit ${destination}?`,
              answer: enrichedData.packing_data.destination_details?.best_time_to_visit || 'Check local climate and events for the best time.'
            },
            {
              question: `What are the must-pack essentials for ${destination}?`,
              answer: 'Essentials include passport, weather-appropriate clothing, chargers, and any destination-specific items.'
            },
            {
              question: `Are there any cultural tips for travelers to ${destination}?`,
              answer: enrichedData.packing_data.destination_details?.cultural_tips || 'Respect local customs and etiquette.'
            },
            {
              question: `What is the local currency and how should I handle money in ${destination}?`,
              answer: enrichedData.packing_data.destination_details?.currency || 'Check the local currency and consider carrying some cash.'
            },
            {
              question: `Is it safe to travel to ${destination}?`,
              answer: enrichedData.packing_data.destination_details?.safety_tips || 'Follow general safety precautions and stay aware of your surroundings.'
            }
          ];
          enrichedData = {
            ...enrichedData,
            packing_data: {
              ...enrichedData.packing_data,
              faqs
            }
          };
        }
        setResult(enrichedData);

        // Automatically save the packing list
        try {
          await fetch('/api/save-packing-list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destination: formData.destination,
              days: formData.days,
              season: formData.season,
              trip_type: formData.trip_type,
              activities: formData.activities,
              packing_list: enrichedData.packing_data.packing_list,
              packing_tips: enrichedData.packing_data.packing_tips,
              destination_notes: enrichedData.packing_data.destination_notes,
              destination_details: enrichedData.packing_data.destination_details,
              faqs: enrichedData.packing_data.faqs,
              destination_image: enrichedData.destination_image
            }),
          });
          setAutoSaved(true);
          // Hide the auto-saved message after 5 seconds
          setTimeout(() => setAutoSaved(false), 5000);
        } catch (saveError) {
          console.error('Failed to auto-save packing list:', saveError);
          // Continue silently - the user still gets their packing list
        }
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch {
      setError('Failed to generate packing list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential': return 'text-red-600 bg-red-50 border-red-200';
      case 'recommended': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'optional': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'clothing': return '👕';
      case 'toiletries': return '🧴';
      case 'electronics': return '🔌';
      case 'documents': return '📄';
      case 'health_safety': return '🏥';
      case 'activity_specific': return '🎯';
      case 'miscellaneous': return '📦';
      default: return '📋';
    }
  };

  const categoryNames: { [key in keyof PackingList]: string } = {
    clothing: 'Clothing',
    toiletries: 'Toiletries',
    electronics: 'Electronics',
    documents: 'Documents',
    health_safety: 'Health & Safety',
    activity_specific: 'Activity Specific',
    miscellaneous: 'Miscellaneous'
  };

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* SEO-Friendly Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Smart Packing List Generator
          </h1>
          <p className="text-xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">
            Create personalized travel packing checklists in seconds. Get AI-powered recommendations 
            based on your destination, activities, weather, and trip type.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
              <span>🌍</span>
              <span>Any Destination</span>
            </span>
            <span className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
              <span>🤖</span>
              <span>AI-Powered</span>
            </span>
            <span className="flex items-center space-x-2 bg-white/60 px-4 py-2 rounded-full">
              <span>⚡</span>
              <span>Instant Results</span>
            </span>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-12 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Perfect Packing List
            </h2>
            <p className="text-gray-600 text-lg">
              Tell us about your trip and we&apos;ll generate a comprehensive, personalized packing checklist
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="destination" className="block text-sm font-semibold text-gray-700">
                  🌍 Destination *
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 text-black"
                  placeholder="e.g., Tokyo, Japan"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="days" className="block text-sm font-semibold text-gray-700">
                  📅 Trip Duration (days) *
                </label>
                <input
                  type="number"
                  id="days"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="8"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 text-black"
                  placeholder="7"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="season" className="block text-sm font-semibold text-gray-700">
                  🌤️ Season *
                </label>
                <select
                  id="season"
                  name="season"
                  value={formData.season}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 text-black"
                >
                  <option value="spring">🌸 Spring</option>
                  <option value="summer">☀️ Summer</option>
                  <option value="autumn">🍂 Autumn</option>
                  <option value="winter">❄️ Winter</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="trip_type" className="block text-sm font-semibold text-gray-700">
                  ✈️ Trip Type *
                </label>
                <select
                  id="trip_type"
                  name="trip_type"
                  value={formData.trip_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 text-black"
                >
                  <option value="leisure">🏖️ Leisure</option>
                  <option value="business">💼 Business</option>
                  <option value="adventure">🏔️ Adventure</option>
                  <option value="cultural">🏛️ Cultural</option>
                  <option value="romantic">💕 Romantic</option>
                  <option value="family">👨‍👩‍👧‍👦 Family</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="activities" className="block text-sm font-semibold text-gray-700">
                🎯 Planned Activities *
              </label>
              <div className="relative">
                <div 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 hover:border-gray-300 cursor-pointer bg-white min-h-[120px] flex items-start"
                  onClick={openActivitiesPopup}
                >
                  <div className="flex-1">
                    {selectedActivities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedActivities.map(activityId => {
                          const activity = activityOptions.find(option => option.id === activityId);
                          return (
                            <span 
                              key={activityId}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {activity?.label}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500">Click to select activities...</span>
                    )}
                  </div>
                  <div className="ml-2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <input
                  type="hidden"
                  name="activities"
                  value={formData.activities}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating Your Perfect List...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>✨ Generate My Packing List</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Navigation Section */}
        <div className="text-center mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/saved-packing-lists"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg transform hover:-translate-y-1"
            >
              <span className="mr-2">🎒</span>
              View Saved Packing Lists
            </Link>
            <Link
              href="/free-travel-planner-ai"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg transform hover:-translate-y-1"
            >
              <span className="mr-2">✈️</span>
              Travel Planner
            </Link>
            <Link
              href="/saved-itineraries"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg transform hover:-translate-y-1"
            >
              <span className="mr-2">🗺️</span>
              Saved Itineraries
            </Link>
          </div>
        </div>

        {/* Activities Selection Popup */}
        {showActivitiesPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">Select Your Activities</h3>
                  <button
                    onClick={closeActivitiesPopup}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Choose the activities you plan to do on your trip</p>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {Object.entries(activityCategories).map(([category, activities]) => (
                    <div key={category} className="border border-gray-200 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activities.map(activity => (
                          <div
                            key={activity.id}
                            onClick={() => handleActivityToggle(activity.id)}
                            className={`
                              p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                              ${selectedActivities.includes(activity.id)
                                ? 'border-blue-500 bg-blue-50 text-blue-800'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`
                                w-5 h-5 rounded border-2 flex items-center justify-center
                                ${selectedActivities.includes(activity.id)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                                }
                              `}>
                                {selectedActivities.includes(activity.id) && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{activity.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedActivities.length} activities selected
                  </span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedActivities([])}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={closeActivitiesPopup}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-12 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="text-red-500 text-2xl">⚠️</div>
              <div>
                <h3 className="text-red-800 font-semibold">Oops! Something went wrong</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-12">
            {/* Auto-saved indicator */}
            {autoSaved && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Packing list automatically saved!</span>
              </div>
            )}

            {/* Packing List Summary Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-8 border-2 border-blue-100">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  📋 Your Packing List Summary
                </h2>
                <p className="text-lg text-gray-700">
                  Complete travel checklist for {formData.destination}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center bg-white/60 rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Object.values(result.packing_data.packing_list).reduce((total, category) => total + category.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Total Items</div>
                </div>
                <div className="text-center bg-white/60 rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {Object.values(result.packing_data.packing_list).reduce((total, category) => 
                      total + (category as PackingItem[]).filter((item: PackingItem) => item.priority === 'essential').length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Essential Items</div>
                </div>
                <div className="text-center bg-white/60 rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{formData.days}</div>
                  <div className="text-sm text-gray-600 font-medium">Trip Days</div>
                </div>
                <div className="text-center bg-white/60 rounded-xl p-4 shadow-md">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {Object.keys(result.packing_data.packing_list).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Categories</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Category Breakdown</span>
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.packing_data.packing_list).map(([category, items]) => (
                      <div key={category} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryEmoji(category)}</span>
                          <span className="font-medium text-gray-700">{categoryNames[category as keyof PackingList]}</span>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                          {items.length} items
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span>⭐</span>
                    <span>Priority Overview</span>
                  </h3>
                  <div className="space-y-4">
                    {['essential', 'recommended', 'optional'].map(priority => {
                      const count = Object.values(result.packing_data.packing_list).reduce(
                        (total, category) => total + (category as PackingItem[]).filter((item: PackingItem) => item.priority === priority).length, 0
                      );
                      const percentage = Math.round((count / Object.values(result.packing_data.packing_list).reduce((total, category) => total + category.length, 0)) * 100);
                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`font-medium capitalize ${
                              priority === 'essential' ? 'text-red-600' :
                              priority === 'recommended' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {priority}
                            </span>
                            <span className="text-sm text-gray-600">{count} items ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                priority === 'essential' ? 'bg-red-500' :
                                priority === 'recommended' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => document.getElementById('packing-list-sections')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                >
                  📋 View Full List
                </button>
                <button
                  onClick={() => {
                    const listText = Object.entries(result.packing_data.packing_list)
                      .map(([category, items]) => 
                        `${categoryNames[category as keyof PackingList]}:\n` +
                        (items as PackingItem[]).map((item: PackingItem) => `- ${item.item} (${item.quantity})`).join('\n')
                      ).join('\n\n');
                    copyToClipboard(listText);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md"
                >
                  📄 Copy List
                </button>
                <Link
                  href="/saved-packing-lists"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                >
                  📋 View All Saved Lists
                </Link>
              </div>
            </div>
            {/* Destination Image */}
            {result.destination_image && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="relative h-80">
                  <Image
                    src={result.destination_image}
                    alt={`${formData.destination} destination`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8">
                      <h2 className="text-4xl font-bold text-white mb-2">
                        {formData.destination}
                      </h2>
                      <p className="text-white/90 text-lg">
                        {formData.days} day {formData.trip_type} trip
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Destination Notes moved to appear above the packing list */}

            {/* Destination Details */}
            {result.packing_data.destination_details && (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <span>📍</span>
                  <span>Destination Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                  <div>
                    <p className="mb-4"><span className="font-semibold">Overview:</span> {result.packing_data.destination_details.overview}</p>
                    <p className="mb-4"><span className="font-semibold">Best time to visit:</span> {result.packing_data.destination_details.best_time_to_visit}</p>
                    <p className="mb-4"><span className="font-semibold">Weather:</span> {result.packing_data.destination_details.weather_summary}</p>
                    <p className="mb-4"><span className="font-semibold">Cultural tips:</span> {result.packing_data.destination_details.cultural_tips}</p>
                  </div>
                  <div>
                    <p className="mb-4"><span className="font-semibold">Transport:</span> {result.packing_data.destination_details.local_transport}</p>
                    <p className="mb-4"><span className="font-semibold">Currency:</span> {result.packing_data.destination_details.currency}</p>
                    <p className="mb-4"><span className="font-semibold">Language:</span> {result.packing_data.destination_details.language}</p>
                    <p className="mb-4"><span className="font-semibold">Power plugs:</span> {result.packing_data.destination_details.power_plugs}</p>
                    <p className="mb-0"><span className="font-semibold">Safety tips:</span> {result.packing_data.destination_details.safety_tips}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Packing Tips */}
            {result.packing_data.packing_tips.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-3xl">💡</div>
                  <h3 className="text-2xl font-bold text-green-800">
                    Pro Packing Tips
                  </h3>
                </div>
                <div className="grid gap-4">
                  {result.packing_data.packing_tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 bg-white/60 rounded-xl p-4">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-green-800 text-lg leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packing List Categories */}
            <div id="packing-list-sections">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Complete Travel Packing Checklist for {formData.destination}
                  {formData.days && formData.trip_type && formData.season && (
                    <span className="block text-2xl text-gray-700 mt-2 font-medium">
                      {formData.days}-Day {formData.trip_type.charAt(0).toUpperCase() + formData.trip_type.slice(1)} Trip in {formData.season.charAt(0).toUpperCase() + formData.season.slice(1)}
                    </span>
                  )}
                </h2>
                <p className="text-xl text-gray-700 mb-4">
                  Personalized travel packing list with essential items, recommendations, and activity-specific gear
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    ✅ Comprehensive Checklist
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    📦 Organized by Category
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                    🎯 Activity-Specific Items
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                    ⭐ Priority Levels
                  </span>
                </div>
              </div>
              {result.packing_data.destination_notes && (
                <div className="text-center mb-8">
                  <p className="text-blue-800 bg-blue-50 border border-blue-200 inline-block mx-auto px-6 py-3 rounded-lg font-medium">
                    💡 {result.packing_data.destination_notes}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(result.packing_data.packing_list).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-3 flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryEmoji(category)}</span>
                      <span>{categoryNames[category as keyof PackingList]}</span>
                    </h4>
                    <ul className="space-y-3">
                      {(items as PackingItem[]).map((item: PackingItem, index: number) => (
                        <li key={index} className="flex items-start space-x-3 group">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              item.priority === 'essential' ? 'bg-red-500' :
                              item.priority === 'recommended' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <span className="font-semibold text-gray-800 text-lg">
                                  {item.item}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  ({item.quantity})
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            {/* Destination FAQs */}
            {result.packing_data.faqs && result.packing_data.faqs.length > 0 && (
              <div className="mt-12 bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8">
                <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center space-x-2">
                  <span>❓</span>
                  <span>Frequently Asked Questions about {formData.destination}</span>
                </h3>
                <div className="space-y-6">
                  {result.packing_data.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4">
                      <div className="font-semibold text-lg text-blue-900 mb-2">{faq.question}</div>
                      <div className="text-gray-700 text-base">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingListGenerator;
