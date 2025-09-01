import Link from 'next/link';
import Image from 'next/image';
import BudgetDisplay from '../../../components/BudgetDisplay';
import GoogleAd from '../../../components/GoogleAd';
import { calculateTripBudget, BudgetBreakdown } from '../../../lib/budget-calculator';
import fs from 'fs';
import path from 'path';

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
  destinationOverview?: string;
  youMightWantToAsk?: Array<{
    question: string;
    answer: string;
  }>;
  bestTimeToVisit?: string;
  hiddenGems?: Array<{
    name: string;
    description: string;
  }>;
  localExperiences?: Array<{
    name: string;
    description: string;
  }>;
  foodAndDining?: Array<{
    name: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Generate static params for all saved itineraries
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const savedItineraries: SavedItinerary[] = JSON.parse(data);
    
    return savedItineraries.map((itinerary) => ({
      id: itinerary.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Get itinerary data at build time
async function getItinerary(id: string): Promise<SavedItinerary | null> {
  try {
    const filePath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const savedItineraries: SavedItinerary[] = JSON.parse(data);
    
    return savedItineraries.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Error reading itinerary:', error);
    return null;
  }
}

export default async function SavedItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  
  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Itinerary Not Found</h2>
            <p className="text-red-600 mb-6">The requested itinerary could not be found.</p>
            <Link
              href="/saved-itineraries"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <span className="mr-2">←</span>
              Back to Saved Itineraries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate budget breakdown
  const tripBudget: BudgetBreakdown | null = itinerary.itinerary ? calculateTripBudget(
    itinerary.itinerary,
    itinerary.budget,
    parseInt(itinerary.days),
    itinerary.travelCompanions
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link
              href="/saved-itineraries"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              <span className="mr-2">←</span>
              Back to Saved Itineraries
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {itinerary.title}
            </h1>
            <p className="text-lg text-gray-600">
              {itinerary.destination} • {itinerary.days} day{itinerary.days !== '1' ? 's' : ''}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Saved on {new Date(itinerary.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-semibold text-gray-900">Destination</div>
                <div className="text-sm text-gray-600">{itinerary.destination}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-gray-900">Duration</div>
                <div className="text-sm text-gray-600">{itinerary.days} day{itinerary.days !== '1' ? 's' : ''}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold text-gray-900">Budget</div>
                <div className="text-sm text-gray-600">{itinerary.budget.split(' ')[0]}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-900">Travel Group</div>
                <div className="text-sm text-gray-600 capitalize">{itinerary.travelCompanions}</div>
              </div>
            </div>

            {/* Interests */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Interests & Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {itinerary.interests.split(',').map((interest, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Itinerary Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Itinerary */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">🗺️</span>
                Your Itinerary
              </h2>

              {/* Destination Photo */}
              {itinerary.destinationImage && (
                <div className="mb-8">
                  <div className="relative rounded-xl overflow-hidden h-64 md:h-80">
                    <Image
                      src={itinerary.destinationImage}
                      alt={`${itinerary.destination} destination photo`}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{itinerary.destination}</h3>
                      <p className="text-lg opacity-90">{itinerary.title}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {itinerary.itinerary.map((day, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-b-0 pb-8 last:pb-0">
                    {/* Day Header */}
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{day.day}</h3>
                        {/* Google Maps Link */}
                        {day.location && day.google_map_url && (
                          <div className="mt-2">
                            <a 
                              href={day.google_map_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                            >
                              <span className="mr-1">📍</span>
                              View {day.location} on Map
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Timeline Layout */}
                    <div className="ml-5 border-l border-gray-200 pl-6 space-y-6">
                      {/* Morning */}
                      <div className="relative">
                        <div className="absolute -left-7 w-3 h-3 bg-white rounded-full border-2 border-gray-300"></div>
                        <div className="bg-white border border-gray-100 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <span className="mr-2 text-lg">🌅</span>
                            Morning
                          </h4>
                          <div className="space-y-2">
                            {day.morning.map((activity, actIndex) => (
                              <div key={actIndex} className="text-gray-700">
                                <span className="font-medium text-gray-900">{activity.activity}</span>
                                {activity.details && (
                                  <span className="text-gray-600 ml-1">— {activity.details}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Afternoon */}
                      <div className="relative">
                        <div className="absolute -left-7 w-3 h-3 bg-white rounded-full border-2 border-gray-300"></div>
                        <div className="bg-white border border-gray-100 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <span className="mr-2 text-lg">☀️</span>
                            Afternoon
                          </h4>
                          <div className="space-y-2">
                            {day.afternoon.map((activity, actIndex) => (
                              <div key={actIndex} className="text-gray-700">
                                <span className="font-medium text-gray-900">{activity.activity}</span>
                                {activity.details && (
                                  <span className="text-gray-600 ml-1">— {activity.details}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Evening */}
                      <div className="relative">
                        <div className="absolute -left-7 w-3 h-3 bg-white rounded-full border-2 border-gray-300"></div>
                        <div className="bg-white border border-gray-100 rounded-lg p-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <span className="mr-2 text-lg">🌙</span>
                            Evening
                          </h4>
                          <div className="space-y-2">
                            {day.evening.map((activity, actIndex) => (
                              <div key={actIndex} className="text-gray-700">
                                <span className="font-medium text-gray-900">{activity.activity}</span>
                                {activity.details && (
                                  <span className="text-gray-600 ml-1">— {activity.details}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Travel Tip */}
                    <div className="mt-6 ml-5 bg-gray-50 rounded-lg p-4 border-l-2 border-gray-300">
                      <h4 className="text-base font-medium text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">💡</span>
                        Travel Tip
                      </h4>
                      <p className="text-gray-700 text-sm italic">
                        &ldquo;{day.travel_tip}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📊</span>
                Trip Information
              </h2>

              {/* Google Ad */}
              <div className="mb-8">
                <GoogleAd 
                  slot="7412321584"
                  format="auto"
                  responsive={true}
                  className="mb-4"
                />
              </div>

              {/* Budget Display */}
              {tripBudget && (
                <div className="mb-8">
                  <BudgetDisplay budget={tripBudget} />
                </div>
              )}

              {/* Destination Overview Sections */}
              {itinerary.destinationOverview && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🌟</span>
                    Destination Overview
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
                    <p className="text-gray-700">{itinerary.destinationOverview}</p>
                  </div>
                </div>
              )}

              {/* You Might Want to Ask */}
              {itinerary.youMightWantToAsk && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">❓</span>
                    You Might Want to Ask
                  </h3>
                  <div className="space-y-3">
                    {itinerary.youMightWantToAsk.map((item, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-300">
                        <div className="text-gray-900 font-medium mb-1 text-sm">
                          {item.question}
                        </div>
                        <div className="text-gray-700 text-sm">
                          {item.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Time to Visit */}
              {itinerary.bestTimeToVisit && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🗓️</span>
                    Best Time to Visit
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-300">
                    <p className="text-gray-700">{itinerary.bestTimeToVisit}</p>
                  </div>
                </div>
              )}

              {/* Hidden Gems */}
              {itinerary.hiddenGems && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💎</span>
                    Hidden Gems
                  </h3>
                  <div className="space-y-3">
                    {itinerary.hiddenGems.map((gem, index) => (
                      <div key={index} className="border-l-2 border-purple-300 pl-4 py-2">
                        <h4 className="font-medium text-gray-900">{gem.name}</h4>
                        <p className="text-sm text-gray-600">{gem.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Experiences */}
              {itinerary.localExperiences && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🎭</span>
                    Local Experiences
                  </h3>
                  <div className="space-y-3">
                    {itinerary.localExperiences.map((experience, index) => (
                      <div key={index} className="border-l-2 border-orange-300 pl-4 py-2">
                        <h4 className="font-medium text-gray-900">{experience.name}</h4>
                        <p className="text-sm text-gray-600">{experience.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Food & Dining */}
              {itinerary.foodAndDining && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🍽️</span>
                    Food & Dining
                  </h3>
                  <div className="space-y-3">
                    {itinerary.foodAndDining.map((food, index) => (
                      <div key={index} className="border-l-2 border-red-300 pl-4 py-2">
                        <h4 className="font-medium text-gray-900">{food.name}</h4>
                        <p className="text-sm text-gray-600">{food.description}</p>
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
