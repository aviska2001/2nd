'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

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

export default function SavedPackingListPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [packingList, setPackingList] = useState<SavedPackingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadPackingList = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-packing-list/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to load packing list');
        }
        
        const data = await response.json();
        setPackingList(data);
      } catch (error) {
        console.error('Error loading packing list:', error);
        setError('Failed to load packing list');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPackingList();
    }
  }, [id]);

  const toggleCheck = (itemKey: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemKey)) {
      newCheckedItems.delete(itemKey);
    } else {
      newCheckedItems.add(itemKey);
    }
    setCheckedItems(newCheckedItems);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getTotalItems = () => {
    if (!packingList) return 0;
    return Object.values(packingList.packing_list).reduce((total, category) => total + category.length, 0);
  };

  const getCheckedCount = () => {
    return checkedItems.size;
  };

  const getProgress = () => {
    const total = getTotalItems();
    const checked = getCheckedCount();
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">🎒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your packing list...</h2>
            <div className="animate-pulse text-gray-600">Please wait</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packingList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Packing List Not Found</h2>
            <p className="text-red-600 mb-6">{error || 'The requested packing list could not be found.'}</p>
            <Link
              href="/saved-packing-lists"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              <span className="mr-2">←</span>
              Back to Saved Packing Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link
              href="/saved-packing-lists"
              className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors font-medium"
            >
              <span className="mr-2">←</span>
              Back to Saved Packing Lists
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {packingList.title}
            </h1>
            <p className="text-lg text-gray-600">
              {packingList.destination} • {packingList.days} day{packingList.days !== '1' ? 's' : ''}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Saved on {new Date(packingList.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Packing Progress</h2>
              <span className="text-lg font-semibold text-green-600">
                {getCheckedCount()} / {getTotalItems()} items
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              {getProgress()}% Complete
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-semibold text-gray-900">Destination</div>
                <div className="text-sm text-gray-600">{packingList.destination}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-gray-900">Duration</div>
                <div className="text-sm text-gray-600">{packingList.days} day{packingList.days !== '1' ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">{getSeasonEmoji(packingList.season)}</div>
                <div className="font-semibold text-gray-900">Season</div>
                <div className="text-sm text-gray-600 capitalize">{packingList.season}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">{getTripTypeEmoji(packingList.trip_type)}</div>
                <div className="font-semibold text-gray-900">Trip Type</div>
                <div className="text-sm text-gray-600 capitalize">{packingList.trip_type}</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-semibold text-gray-900">Total Items</div>
                <div className="text-sm text-gray-600">{getTotalItems()}</div>
              </div>
            </div>

            {/* Activities */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Planned Activities</h3>
              <div className="flex flex-wrap gap-2">
                {packingList.activities.split(',').map((activity, index) => (
                  <span
                    key={index}
                    className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                  >
                    {activity.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Destination Image */}
          {packingList.destination_image && (
            <div className="mb-8">
              <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 shadow-lg">
                <Image
                  src={packingList.destination_image}
                  alt={`${packingList.destination} destination photo`}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{packingList.destination}</h3>
                  <p className="text-lg opacity-90">{packingList.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Packing List */}
            <div className="lg:col-span-2 space-y-8">
              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => {
                      const listText = Object.entries(packingList.packing_list)
                        .map(([category, items]) => 
                          `${categoryNames[category as keyof PackingList]}:\n` +
                          items.map((item: PackingItem) => `- ${item.item} (${item.quantity})`).join('\n')
                        ).join('\n\n');
                      copyToClipboard(listText);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                  >
                    📄 Copy List
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-md"
                  >
                    🖨️ Print List
                  </button>
                  <button
                    onClick={() => setCheckedItems(new Set())}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md"
                  >
                    🔄 Reset Checkboxes
                  </button>
                </div>
              </div>

              {/* Packing Categories */}
              <div className="grid gap-6">
                {Object.entries(packingList.packing_list).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-3 flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryEmoji(category)}</span>
                      <span>{categoryNames[category as keyof PackingList]}</span>
                      <span className="text-sm font-normal text-gray-500">({items.length} items)</span>
                    </h3>
                    <div className="space-y-3">
                      {items.map((item: PackingItem, index: number) => {
                        const itemKey = `${category}-${index}`;
                        const isChecked = checkedItems.has(itemKey);
                        return (
                          <div key={index} className="flex items-start space-x-3 group">
                            <div className="flex-shrink-0 mt-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCheck(itemKey)}
                                className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                              />
                            </div>
                            <div className={`flex-1 min-w-0 ${isChecked ? 'opacity-50' : ''}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <span className={`font-semibold text-gray-800 text-lg ${isChecked ? 'line-through' : ''}`}>
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-8">
              {/* Destination Notes */}
              {packingList.destination_notes && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    Destination Notes
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
                    <p className="text-gray-700">{packingList.destination_notes}</p>
                  </div>
                </div>
              )}

              {/* Packing Tips */}
              {packingList.packing_tips.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Packing Tips
                  </h3>
                  <div className="space-y-3">
                    {packingList.packing_tips.map((tip: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 bg-green-50 rounded-lg p-3">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-green-800 leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destination Details */}
              {packingList.destination_details && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📍</span>
                    Destination Info
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-800">Best time to visit:</span>
                      <p className="text-gray-600 mt-1">{packingList.destination_details.best_time_to_visit}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Weather:</span>
                      <p className="text-gray-600 mt-1">{packingList.destination_details.weather_summary}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Currency:</span>
                      <p className="text-gray-600 mt-1">{packingList.destination_details.currency}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Power plugs:</span>
                      <p className="text-gray-600 mt-1">{packingList.destination_details.power_plugs}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Safety tips:</span>
                      <p className="text-gray-600 mt-1">{packingList.destination_details.safety_tips}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {packingList.faqs && packingList.faqs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">❓</span>
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {packingList.faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <div className="font-semibold text-gray-900 mb-2">{faq.question}</div>
                        <div className="text-gray-700 text-sm">{faq.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
