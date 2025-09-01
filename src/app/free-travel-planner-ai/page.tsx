'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import StructuredData from '../../components/StructuredData';
import BudgetDisplay from '../../components/BudgetDisplay';
import GoogleAd from '../../components/GoogleAd';
import { calculateTripBudget, BudgetBreakdown } from '../../lib/budget-calculator';
import { generateSEOTitle, generateSEODescription } from '../../lib/seo-title-generator';

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

interface ItineraryResponse {
  itinerary: DayItinerary[];
  destinationImage?: string;
  destination?: string;
}

interface DestinationOverview {
  destinationOverview: string;
  youMightWantToAsk: Array<{
    question: string;
    answer: string;
  }>;
  bestTimeToVisit: string;
  hiddenGems: Array<{
    name: string;
    description: string;
  }>;
  localExperiences: Array<{
    name: string;
    description: string;
  }>;
  foodAndDining: Array<{
    name: string;
    description: string;
  }>;
}

export default function TripPlanner() {
  const [formData, setFormData] = useState({
    destination: '',
    days: '',
    budget: '',
    travelCompanions: '',
    interests: ''
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterests, setCustomInterests] = useState('');
  const [showInterestsPopup, setShowInterestsPopup] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [destinationOverview, setDestinationOverview] = useState<DestinationOverview | null>(null);
  const [tripBudget, setTripBudget] = useState<BudgetBreakdown | null>(null);
  const [seoTitle, setSeoTitle] = useState<string>('Plan Your Perfect Trip Instantly - Free Travel Planner AI');
  const [seoDescription, setSeoDescription] = useState<string>('Plan your next adventure with our free travel planner AI. Customize your trip by city, budget, travel companions, and interests.');
  const [loading, setLoading] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  // Ref for auto-scrolling to itinerary results
  const itineraryResultsRef = useRef<HTMLDivElement>(null);

  // Set initial page title and meta description
  useEffect(() => {
    document.title = 'Plan Your Perfect Trip Instantly - Free Travel Planner AI';
    
    // Update meta description if possible
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Plan your next adventure with our free travel planner AI. Customize your trip by city, budget, travel companions, and interests.');
    } else {
      // Create meta description if it doesn't exist
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', 'Plan your next adventure with our free travel planner AI. Customize your trip by city, budget, travel companions, and interests.');
      document.head.appendChild(metaDescription);
    }
  }, []);

  // Update page title when SEO title is generated
  useEffect(() => {
    if (seoTitle) {
      document.title = seoTitle;
      // Update meta description if possible
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && seoDescription) {
        metaDescription.setAttribute('content', seoDescription);
      }
    }
  }, [seoTitle, seoDescription]);

  // Auto-scroll to itinerary when it's generated
  useEffect(() => {
    if (itinerary && itineraryResultsRef.current) {
      // Wait a brief moment for the content to render, then scroll
      setTimeout(() => {
        itineraryResultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
    }
  }, [itinerary]);

  // Predefined interests categories
  const interestCategories = [
    { id: 'culture', label: 'Culture & History', emoji: '🏛️', items: ['Museums', 'Historical Sites', 'Architecture', 'Local Traditions'] },
    { id: 'food', label: 'Food & Drink', emoji: '🍽️', items: ['Local Cuisine', 'Street Food', 'Fine Dining', 'Food Markets', 'Cooking Classes'] },
    { id: 'adventure', label: 'Adventure & Sports', emoji: '🏔️', items: ['Hiking', 'Water Sports', 'Extreme Sports', 'Cycling', 'Rock Climbing'] },
    { id: 'nature', label: 'Nature & Wildlife', emoji: '🌿', items: ['National Parks', 'Wildlife Watching', 'Gardens', 'Beaches', 'Scenic Views'] },
    { id: 'entertainment', label: 'Entertainment & Nightlife', emoji: '🎭', items: ['Nightlife', 'Live Music', 'Theater', 'Festivals', 'Casinos'] },
    { id: 'shopping', label: 'Shopping & Markets', emoji: '🛍️', items: ['Local Markets', 'Shopping Centers', 'Antiques', 'Souvenirs', 'Fashion'] },
    { id: 'wellness', label: 'Wellness & Relaxation', emoji: '🧘', items: ['Spas', 'Yoga', 'Meditation', 'Hot Springs', 'Wellness Retreats'] },
    { id: 'photography', label: 'Photography & Art', emoji: '📸', items: ['Photography Spots', 'Art Galleries', 'Street Art', 'Instagrammable Places'] }
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest) 
        ? prev.filter(item => item !== interest)
        : [...prev, interest];
      
      // Update the combined interests in formData
      updateCombinedInterests(newInterests, customInterests);
      return newInterests;
    });
  };

  const updateCombinedInterests = (selected: string[], custom: string) => {
    const combinedInterests = [
      ...selected,
      ...(custom.trim() ? [custom.trim()] : [])
    ].join(', ');
    
    setFormData(prev => ({
      ...prev,
      interests: combinedInterests
    }));
  };

  const handleCustomInterestsChange = (value: string) => {
    setCustomInterests(value);
    updateCombinedInterests(selectedInterests, value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.destination.trim() !== '';
      case 2: return formData.days !== '';
      case 3: return formData.budget !== '';
      case 4: return formData.travelCompanions !== '';
      case 5: return selectedInterests.length > 0 || customInterests.trim() !== '';
      default: return false;
    }
  };

  const generateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingOverview(true);
    setError('');
    setItinerary(null);
    setDestinationOverview(null);
    setTripBudget(null);

    try {
      // Generate SEO title and description
      const generatedSeoTitle = generateSEOTitle(formData);
      const generatedSeoDescription = generateSEODescription(formData);
      setSeoTitle(generatedSeoTitle);
      setSeoDescription(generatedSeoDescription);

      // Generate itinerary and destination overview in parallel
      const [itineraryResponse, overviewResponse] = await Promise.all([
        fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }),
        fetch('/api/destination-overview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ destination: formData.destination }),
        })
      ]);

      // Handle itinerary response
      const itineraryData = await itineraryResponse.json();
      if (!itineraryResponse.ok) {
        throw new Error(itineraryData.error || `HTTP error! status: ${itineraryResponse.status}`);
      }
      setItinerary(itineraryData);
      setLoading(false);

      // Calculate budget breakdown
      if (itineraryData.itinerary) {
        const budgetBreakdown = calculateTripBudget(
          itineraryData.itinerary,
          formData.budget,
          parseInt(formData.days),
          formData.travelCompanions
        );
        setTripBudget(budgetBreakdown);
      }

      // Handle overview response
      const overviewData = await overviewResponse.json();
      if (!overviewResponse.ok) {
        console.warn('Failed to fetch destination overview:', overviewData.error);
        // Don't throw error for overview failure, just log it
      } else {
        setDestinationOverview(overviewData);
      }
      setLoadingOverview(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating itinerary:', err);
      setLoading(false);
      setLoadingOverview(false);
    }
  };

  const saveItinerary = async () => {
    if (!itinerary || !saveTitle.trim()) return;
    
    try {
      setSaveLoading(true);
      const response = await fetch('/api/save-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: saveTitle.trim(),
          destination: formData.destination,
          days: formData.days,
          budget: formData.budget,
          travelCompanions: formData.travelCompanions,
          interests: formData.interests,
          itinerary: itinerary.itinerary,
          destinationImage: itinerary.destinationImage,
          destinationOverview: destinationOverview?.destinationOverview,
          youMightWantToAsk: destinationOverview?.youMightWantToAsk,
          bestTimeToVisit: destinationOverview?.bestTimeToVisit,
          hiddenGems: destinationOverview?.hiddenGems,
          localExperiences: destinationOverview?.localExperiences,
          foodAndDining: destinationOverview?.foodAndDining,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save itinerary');
      }

      setSaveSuccess(true);
      setShowSaveModal(false);
      setSaveTitle('');
      
      // Show success message for a few seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <StructuredData 
        itineraryData={seoTitle ? {
          title: seoTitle,
          description: seoDescription,
          destination: formData.destination,
          duration: formData.days,
          budget: formData.budget,
          travelCompanions: formData.travelCompanions,
          interests: formData.interests
        } : undefined}
      />
      
      {/* Full Screen Loading Animation */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="text-center">
            {/* Rotating Globe */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="text-6xl animate-spin" style={{ animationDuration: '3s' }}>
                🌍
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-black drop-shadow-sm">
                Creating your itinerary...
              </h2>
              <p className="text-lg text-gray-800 drop-shadow-sm">
                Please wait while we craft your perfect trip
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="mr-3">✈️</span>
              AI Trip Planner
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Create detailed, personalized travel itineraries with AI-powered recommendations
            </p>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/saved-itineraries"
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                <span className="mr-1">🗺️</span>
                Saved Itineraries
              </a>
              <a
                href="/free-packing-list-generator"
                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                <span className="mr-1">🎒</span>
                Packing Lists
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <div className="text-sm text-gray-600 font-medium">
                Step {currentStep} of 5
              </div>
            </div>
          </div>

          {/* Split Screen Layout */}
          <div className="grid lg:grid-cols-2 gap-8 min-h-[600px]">
            {/* Left Panel - Current Step */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-between">
              {/* Step 1: Destination */}
              {currentStep === 1 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🌍</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Where to?</h2>
                    <p className="text-gray-600 text-lg">Tell us your dream destination</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-4">
                        Destination
                      </label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="e.g., Paris, France or Tokyo, Japan"
                        className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        autoFocus
                      />
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-blue-800 text-sm">
                        💡 <strong>Tip:</strong> Be specific! Include the city and country for better recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Number of Days */}
              {currentStep === 2 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">📅</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">How long?</h2>
                    <p className="text-gray-600 text-lg">Choose your trip duration</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-4">
                        Number of Days
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, days: day.toString() }))}
                            className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${
                              formData.days === day.toString()
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-black'
                            }`}
                          >
                            {day} day{day > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-green-800 text-sm">
                        💡 <strong>Tip:</strong> 3-5 days are perfect for most city breaks, while 7-8 days allow for more thorough exploration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Budget Range */}
              {currentStep === 3 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">💰</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">What&apos;s your budget?</h2>
                    <p className="text-gray-600 text-lg">Select your daily spending range</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { value: 'Budget-friendly ($50-100/day)', emoji: '🏠', desc: 'Hostels, street food, public transport' },
                      { value: 'Mid-range ($100-250/day)', emoji: '🏨', desc: '3-star hotels, casual dining, some attractions' },
                      { value: 'Luxury ($250-500/day)', emoji: '✨', desc: '4-star hotels, fine dining, private tours' },
                      { value: 'Ultra-luxury ($500+/day)', emoji: '👑', desc: '5-star resorts, premium experiences, VIP services' }
                    ].map((budget) => (
                      <button
                        key={budget.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, budget: budget.value }))}
                        className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                          formData.budget === budget.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-3xl mr-4">{budget.emoji}</span>
                          <div>
                            <div className={`font-semibold ${
                              formData.budget === budget.value ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {budget.value}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{budget.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Travel Companions */}
              {currentStep === 4 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">👥</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Who&apos;s traveling?</h2>
                    <p className="text-gray-600 text-lg">Tell us about your travel group</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { value: 'solo traveler', emoji: '🚶', desc: 'Just me, myself and I' },
                      { value: 'couple', emoji: '💑', desc: 'Two lovebirds exploring together' },
                      { value: 'family with young children', emoji: '👨‍👩‍👧‍👦', desc: 'Family fun with little ones' },
                      { value: 'family with teenagers', emoji: '👨‍👩‍👧‍👦', desc: 'Adventure-seeking family with teens' },
                      { value: 'group of friends', emoji: '👫', desc: 'Squad goals and good vibes' },
                      { value: 'business travelers', emoji: '💼', desc: 'Mixing business with pleasure' }
                    ].map((companion) => (
                      <button
                        key={companion.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, travelCompanions: companion.value }))}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          formData.travelCompanions === companion.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-4">{companion.emoji}</span>
                          <div>
                            <div className={`font-semibold capitalize ${
                              formData.travelCompanions === companion.value ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {companion.value}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{companion.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Interests & Preferences */}
              {currentStep === 5 && (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">What excites you?</h2>
                    <p className="text-gray-600 text-lg">Select your interests and add custom preferences</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Main Interest Selection Button */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-4">
                        Interests & Preferences
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowInterestsPopup(true)}
                        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {selectedInterests.length > 0 || customInterests.trim() 
                                ? `${selectedInterests.length} interests selected` 
                                : 'Click to select your interests'}
                            </div>
                            {selectedInterests.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {selectedInterests.slice(0, 5).map((interest) => (
                                  <span
                                    key={interest}
                                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                                {selectedInterests.length > 5 && (
                                  <span className="text-sm text-blue-600">+{selectedInterests.length - 5} more</span>
                                )}
                              </div>
                            )}
                            {customInterests.trim() && (
                              <div className="text-sm text-gray-600 italic">
                                Plus custom preferences
                              </div>
                            )}
                            {selectedInterests.length === 0 && !customInterests.trim() && (
                              <div className="text-gray-500">
                                Browse categories like Culture, Food, Adventure, Nature and more...
                              </div>
                            )}
                          </div>
                          <div className="text-3xl text-gray-400">
                            ⚙️
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Additional Preferences Input Box */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-4">
                        Additional Preferences
                      </label>
                      <textarea
                        value={customInterests}
                        onChange={(e) => handleCustomInterestsChange(e.target.value)}
                        placeholder="Add any specific interests, preferences, or special requirements. For example: photography tours, vegetarian restaurants, accessible attractions, family-friendly activities, budget-conscious options..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        rows={4}
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        💡 This helps us customize your itinerary with specific preferences not covered by the main categories.
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-purple-800 text-sm">
                        💡 <strong>Tip:</strong> Select multiple interests to get a well-rounded itinerary!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Previous
                </button>
                
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      canProceed()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={generateItinerary}
                    disabled={loading || !canProceed()}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                      loading || !canProceed()
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">🗺️</span>
                      Generate Itinerary
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel - Summary/Preview */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📋</span>
                Trip Summary
              </h3>
              
              <div className="space-y-6">
                {/* Destination Summary */}
                <div className={`p-4 rounded-xl border-2 ${
                  formData.destination ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🌍</span>
                    <div>
                      <div className="font-semibold text-gray-900">Destination</div>
                      <div className={`text-sm ${formData.destination ? 'text-green-700' : 'text-gray-500'}`}>
                        {formData.destination || 'Not selected yet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Days Summary */}
                <div className={`p-4 rounded-xl border-2 ${
                  formData.days ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <div className="font-semibold text-gray-900">Duration</div>
                      <div className={`text-sm ${formData.days ? 'text-green-700' : 'text-gray-500'}`}>
                        {formData.days ? `${formData.days} day${formData.days !== '1' ? 's' : ''}` : 'Not selected yet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Summary */}
                <div className={`p-4 rounded-xl border-2 ${
                  formData.budget ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💰</span>
                    <div>
                      <div className="font-semibold text-gray-900">Budget</div>
                      <div className={`text-sm ${formData.budget ? 'text-green-700' : 'text-gray-500'}`}>
                        {formData.budget || 'Not selected yet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Companions Summary */}
                <div className={`p-4 rounded-xl border-2 ${
                  formData.travelCompanions ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <div className="font-semibold text-gray-900">Travel Group</div>
                      <div className={`text-sm capitalize ${formData.travelCompanions ? 'text-green-700' : 'text-gray-500'}`}>
                        {formData.travelCompanions || 'Not selected yet'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests Summary */}
                <div className={`p-4 rounded-xl border-2 ${
                  selectedInterests.length > 0 || customInterests.trim() ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3 mt-1">🎯</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Interests</div>
                      <div className={`text-sm ${selectedInterests.length > 0 || customInterests.trim() ? 'text-green-700' : 'text-gray-500'}`}>
                        {selectedInterests.length > 0 || customInterests.trim() ? (
                          <div className="mt-1 space-y-2">
                            {selectedInterests.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {selectedInterests.slice(0, 3).map((interest) => (
                                  <span key={interest} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    {interest}
                                  </span>
                                ))}
                                {selectedInterests.length > 3 && (
                                  <span className="text-xs text-green-600">+{selectedInterests.length - 3} more</span>
                                )}
                              </div>
                            )}
                            {customInterests.trim() && (
                              <div className="text-xs text-green-600 italic">
                                Plus custom preferences
                              </div>
                            )}
                          </div>
                        ) : (
                          'Not specified yet'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completion Status */}
              <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-semibold">Progress</span>
                  <span className="text-blue-600 text-sm">
                    {[
                      formData.destination.trim() !== '',
                      formData.days !== '',
                      formData.budget !== '',
                      formData.travelCompanions !== '',
                      selectedInterests.length > 0 || customInterests.trim() !== ''
                    ].filter(Boolean).length}/5 completed
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${([
                        formData.destination.trim() !== '',
                        formData.days !== '',
                        formData.budget !== '',
                        formData.travelCompanions !== '',
                        selectedInterests.length > 0 || customInterests.trim() !== ''
                      ].filter(Boolean).length / 5) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center">
                <span className="text-3xl mr-4">⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Oops! Something went wrong</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Itinerary Results - Two Column Layout */}
          {itinerary && (
            <div ref={itineraryResultsRef}>
              {/* Save Success Message */}
              {saveSuccess && (
                <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">✅</span>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Itinerary Saved Successfully!</h3>
                      <p className="text-green-700 mt-1">
                        Your trip has been saved. 
                        <a href="/saved-itineraries" className="underline ml-1 hover:text-green-900">
                          View all saved itineraries
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Itinerary Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    setShowSaveModal(true);
                    setSaveTitle(seoTitle || `${formData.destination} - ${formData.days} Day Trip`);
                  }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-bold shadow-lg transform hover:-translate-y-1"
                >
                  <span className="mr-2">💾</span>
                  Save Itinerary
                </button>
              </div>

              <div className="mt-8 grid lg:grid-cols-2 gap-8">
              {/* Left Column - Itinerary */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                {/* SEO Title Header */}
                <div className="mb-6 text-center border-b border-gray-100 pb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {seoTitle}
                  </h1>
                  {seoDescription && (
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      {seoDescription}
                    </p>
                  )}
                </div>

              {/* Destination Photo */}
              {itinerary.destinationImage && (
                <div className="mb-8">
                  <div className="relative rounded-xl overflow-hidden h-64 md:h-80">
                    <Image
                      src={itinerary.destinationImage}
                      alt={`${formData.destination} destination photo`}
                      className="w-full h-full object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{formData.destination}</h2>
                      <p className="text-lg opacity-90">{seoTitle}</p>
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
                              <span className="mr-1">�</span>
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

              {/* Right Column - Destination Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                {/* Google Ad - TTD 1 */}
                <div className="mb-6">
                  <GoogleAd 
                    slot="7412321584"
                    format="auto"
                    responsive={true}
                    className="mb-4"
                  />
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">🌎</span>
                  Discover {formData.destination}
                </h2>

                {loadingOverview ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      {/* Enhanced AI Loading Animation */}
                      <div className="relative w-16 h-16 mx-auto mb-6">
                        {/* Central brain core */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                        
                        {/* Rotating outer ring */}
                        <div className="absolute inset-0 border-4 border-transparent border-t-blue-300 border-r-purple-300 rounded-full animate-spin"></div>
                        
                        {/* Orbiting data points */}
                        <div className="absolute inset-0">
                          <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping" 
                               style={{
                                 top: '4px',
                                 left: '50%',
                                 transformOrigin: '0px 28px',
                                 animation: 'spin 3s linear infinite, ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                               }}>
                          </div>
                          <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" 
                               style={{
                                 top: '50%',
                                 right: '4px',
                                 transformOrigin: '-28px 0px',
                                 animation: 'spin 2s linear infinite reverse, ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                                 animationDelay: '0.5s'
                               }}>
                          </div>
                          <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping" 
                               style={{
                                 bottom: '4px',
                                 left: '50%',
                                 transformOrigin: '0px -28px',
                                 animation: 'spin 2.5s linear infinite, ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                                 animationDelay: '1s'
                               }}>
                          </div>
                          <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" 
                               style={{
                                 top: '50%',
                                 left: '4px',
                                 transformOrigin: '28px 0px',
                                 animation: 'spin 1.8s linear infinite, ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                                 animationDelay: '1.5s'
                               }}>
                          </div>
                        </div>
                        
                        {/* Neural network connections */}
                        <div className="absolute inset-2 opacity-70">
                          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent top-1/2 animate-pulse"></div>
                          <div className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-purple-400 to-transparent left-1/2 animate-pulse" 
                               style={{ animationDelay: '0.7s' }}>
                          </div>
                          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent top-1/2 rotate-45 animate-pulse" 
                               style={{ animationDelay: '1.4s' }}>
                          </div>
                          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent top-1/2 -rotate-45 animate-pulse" 
                               style={{ animationDelay: '2.1s' }}>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          AI is discovering insights...
                        </p>
                        <p className="text-sm text-gray-500 animate-pulse">
                          Analyzing local attractions, hidden gems, and insider tips
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {destinationOverview ? (
                      <>
                        {/* Destination Overview */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">📝</span>
                            Destination Overview
                          </h3>
                          <p className="text-gray-700 leading-relaxed">{destinationOverview.destinationOverview}</p>
                        </div>

                        {/* Budget Display */}
                        {tripBudget && <BudgetDisplay budget={tripBudget} />}

                        {/* You Might Want to Ask */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">❓</span>
                            You Might Want to Ask
                          </h3>
                          <div className="space-y-4">
                            {destinationOverview.youMightWantToAsk.map((item, index) => (
                              <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
                                <div className="text-gray-900 font-medium mb-2">
                                  {item.question}
                                </div>
                                <div className="text-gray-700 text-sm">
                                  {item.answer}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Best Time to Visit */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">🗓️</span>
                            Best Time to Visit
                          </h3>
                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-300">
                            <p className="text-gray-700">{destinationOverview.bestTimeToVisit}</p>
                          </div>
                        </div>

                        {/* Hidden Gems */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">💎</span>
                            Hidden Gems
                          </h3>
                          <div className="space-y-3">
                            {destinationOverview.hiddenGems.slice(0, 5).map((gem, index) => (
                              <div key={index} className="border-l-2 border-purple-300 pl-4 py-2">
                                <h4 className="font-medium text-gray-900">{gem.name}</h4>
                                <p className="text-sm text-gray-600">{gem.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Local Experiences */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">🎭</span>
                            Local Experiences
                          </h3>
                          <div className="space-y-3">
                            {destinationOverview.localExperiences.slice(0, 5).map((experience, index) => (
                              <div key={index} className="border-l-2 border-orange-300 pl-4 py-2">
                                <h4 className="font-medium text-gray-900">{experience.name}</h4>
                                <p className="text-sm text-gray-600">{experience.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Food & Dining */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">🍽️</span>
                            Food & Dining
                          </h3>
                          <div className="space-y-3">
                            {destinationOverview.foodAndDining.slice(0, 5).map((food, index) => (
                              <div key={index} className="border-l-2 border-red-300 pl-4 py-2">
                                <h4 className="font-medium text-gray-900">{food.name}</h4>
                                <p className="text-sm text-gray-600">{food.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <span className="text-4xl mb-4 block">🌍</span>
                        <p>Destination overview could not be loaded.</p>
                        <p className="text-sm mt-2">Don&apos;t worry, your itinerary is ready!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Itinerary Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Save Your Itinerary</h3>
                  <p className="text-green-100 mt-1">Give your trip a memorable name</p>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Itinerary Title
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g., Amazing Paris Adventure"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {saveTitle.length}/100 characters
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveItinerary}
                  disabled={saveLoading || !saveTitle.trim()}
                  className={`flex-1 px-4 py-3 rounded-xl transition-colors font-semibold ${
                    saveLoading || !saveTitle.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                  }`}
                >
                  {saveLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">💾</span>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">💾</span>
                      Save Trip
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interests Selection Popup Modal */}
      {showInterestsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Select Your Interests & Preferences</h3>
                  <p className="text-blue-100 mt-1">Choose what excites you most about traveling</p>
                </div>
                <button
                  onClick={() => setShowInterestsPopup(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Predefined Interest Categories */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Interest Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interestCategories.map((category) => (
                      <div key={category.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">{category.emoji}</span>
                          <h5 className="font-semibold text-gray-900">{category.label}</h5>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {category.items.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleInterest(item)}
                              className={`p-3 text-sm rounded-lg border transition-all text-left flex items-center justify-between ${
                                selectedInterests.includes(item)
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <span>{item}</span>
                              {selectedInterests.includes(item) && (
                                <span className="text-blue-600 font-bold">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Interests Input - Moved below selections */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">✏️</span>
                    Additional Preferences
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <textarea
                      value={customInterests}
                      onChange={(e) => handleCustomInterestsChange(e.target.value)}
                      placeholder="Add any specific interests, preferences, or special requirements not covered above. For example: photography tours, vegetarian restaurants, accessible attractions, family-friendly activities, budget-conscious options..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none bg-white"
                      rows={4}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      💡 This helps us customize your itinerary with specific preferences not covered by the categories above.
                    </div>
                  </div>
                </div>

                {/* Selected Interests Summary */}
                {(selectedInterests.length > 0 || customInterests.trim()) && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="mr-2">📋</span>
                      Your Selected Interests ({selectedInterests.length + (customInterests.trim() ? 1 : 0)})
                    </h4>
                    <div className="space-y-3">
                      {selectedInterests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedInterests.map((interest) => (
                            <span
                              key={interest}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {interest}
                              <button
                                type="button"
                                onClick={() => toggleInterest(interest)}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {customInterests.trim() && (
                        <div className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="text-sm font-medium text-blue-900 mb-1">Custom Preferences:</div>
                          <div className="text-sm text-blue-700">{customInterests}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedInterests.length > 0 || customInterests.trim() 
                  ? `${selectedInterests.length + (customInterests.trim() ? 1 : 0)} interest${selectedInterests.length + (customInterests.trim() ? 1 : 0) !== 1 ? 's' : ''} selected`
                  : 'No interests selected yet'
                }
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInterests([]);
                    setCustomInterests('');
                    updateCombinedInterests([], '');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setShowInterestsPopup(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
