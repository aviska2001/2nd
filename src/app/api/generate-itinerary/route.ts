import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateSEOTitle } from '@/lib/seo-title-generator';

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

// Fetch destination image from Pexels API
async function fetchDestinationImage(destination: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY || 'RTEhJkBSZhwSPVCC6DCb9MNtHrGSPF9fCTJRCCGF9m5mAprzm1qR7msG';
  const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination + ' travel')}&per_page=1`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.photos?.[0]?.src?.large) {
      return data.photos[0].src.large;
    }

    return null;
  } catch (error) {
    console.error('Error fetching destination image:', error);
    return null;
  }
}

// Define interface for destination overview data
interface DestinationOverview {
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
}

// Fetch destination overview data
async function fetchDestinationOverview(destination: string): Promise<DestinationOverview | null> {
  try {
    const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/destination-overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ destination }),
    });

    if (!response.ok) {
      console.error('Failed to fetch destination overview:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching destination overview:', error);
    return null;
  }
}

function setPrompt(destination: string, days: string, budget: string, travelCompanions: string, interests: string) {
  return `Generate a detailed ${days}-day itinerary for ${destination}, with a budget of ${budget}, for a ${travelCompanions} group, prioritizing ${interests}.

Guidelines:
1. Mix popular attractions and off-the-beaten-path experiences.
2. Consider group dynamics and interests for activities.
3. Include budget-friendly and splurge experiences within budget.
4. Suggest local cuisines and dining experiences.
5. Include practical travel tips and logistical information.
6. Ensure activities suit the time of year and weather.
7. For each day, identify a specific primary location/area/district and create an accurate Google Maps URL.

Return a structured JSON object:
{
  "itinerary": [
    {
      "day": "Day {n} - {Specific Area/District}",
      "location": "Specific location/area name (e.g., 'Udawalawe National Park', 'Montmartre District', 'Times Square Area')",
      "google_map_url": "https://www.google.com/maps/search/{location_encoded_properly}",
      "morning": [
        {
          "activity": "Activity 1",
          "details": "15-word description"
        },
        {
          "activity": "Activity 2",
          "details": "15-word description"
        }
      ],
      "afternoon": [
        {
          "activity": "Activity 3",
          "details": "15-word description"
        },
        {
          "activity": "Activity 4",
          "details": "15-word description"
        }
      ],
      "evening": [
        {
          "activity": "Activity 5",
          "details": "15-word description"
        },
        {
          "activity": "Activity 6",
          "details": "15-word description"
        }
      ],
      "travel_tip": "A useful travel tip for the day"
    }
  ]
}

CRITICAL Instructions for Google Maps URLs:
- Always include both "location" and "google_map_url" fields
- The "location" should be a specific, recognizable place name
- Google Maps URLs must follow this exact format: https://www.google.com/maps/search/{encoded_location}
- Replace spaces with + signs and encode special characters properly
- Examples:
  * "Udawalawe National Park" → "https://www.google.com/maps/search/Udawalawe+National+Park"
  * "Eiffel Tower Paris" → "https://www.google.com/maps/search/Eiffel+Tower+Paris"
  * "Times Square New York" → "https://www.google.com/maps/search/Times+Square+New+York"
- Always include the city/country context for better accuracy

Ensure:
- All activities have a 25-word description.
- Activities are safe, group-appropriate, and within budget.
- Provide a useful travel tip for each day.
- Include accurate, clickable Google Maps URLs for each day's primary location.
- The JSON is clean, valid, and follows the exact structure.`;
}

async function generateWithGemini(prompt: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an expert travel planner. Always respond with valid JSON only, no additional text or formatting.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url: response.url
    });
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
    console.error('Invalid Gemini API response structure:', data);
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: NextRequest) {
  try {
    const { destination, days, budget, travelCompanions, interests } = await request.json();

    // Validate required fields
    if (!destination || !days || !budget || !travelCompanions || !interests) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const prompt = setPrompt(destination, days, budget, travelCompanions, interests);
    let itineraryText: string;

    // Check if we have valid Gemini API key
    const hasValidGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_new_api_key_here';
    
    if (!hasValidGeminiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add your Gemini API key to .env.local' },
        { status: 500 }
      );
    }

    // Use Gemini API
    try {
      console.log('Using Gemini API...');
      itineraryText = await generateWithGemini(prompt);
    } catch (geminiError) {
      console.error('Gemini API failed:', geminiError);
      return NextResponse.json(
        { error: 'Gemini API failed. Please check your API key and try again.' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let itinerary;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanText = itineraryText.replace(/```json\n?|\n?```/g, '').trim();
      itinerary = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', itineraryText);
      return NextResponse.json(
        { error: 'Failed to parse AI response. The AI returned invalid JSON.' },
        { status: 500 }
      );
    }

    // Fetch destination image and overview in parallel
    const [destinationImage, destinationOverview] = await Promise.all([
      fetchDestinationImage(destination),
      fetchDestinationOverview(destination)
    ]);
    
    // Add destination data to itinerary
    const enrichedItinerary = {
      ...itinerary,
      destinationImage,
      destination
    };

    // Auto-save the itinerary with destination overview data
    try {
      const title = generateSEOTitle({ destination, days, budget, travelCompanions, interests });
      
      // Create user-data directory if it doesn't exist
      const userDataDir = path.join(process.cwd(), 'user-data', 'itineraries');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      
      const filePath = path.join(userDataDir, 'saved-itineraries.json');      // Read existing itineraries or create empty array
      let savedItineraries: SavedItinerary[] = [];
      if (fs.existsSync(filePath)) {
        try {
          const data = fs.readFileSync(filePath, 'utf8');
          savedItineraries = JSON.parse(data);
        } catch (error) {
          console.error('Error reading saved itineraries:', error);
          savedItineraries = [];
        }
      }

      // Generate sequential ID starting from 1
      const getNextId = () => {
        if (savedItineraries.length === 0) {
          return '1';
        }
        
        // Find the highest existing numeric ID
        const numericIds = savedItineraries
          .map(item => parseInt(item.id))
          .filter(id => !isNaN(id));
        
        if (numericIds.length === 0) {
          return '1';
        }
        
        const maxId = Math.max(...numericIds);
        return (maxId + 1).toString();
      };
      
      const id = getNextId();
      const now = new Date().toISOString();

      // Create new itinerary object with destination overview data
      const newItinerary: SavedItinerary = {
        id,
        title,
        destination,
        days,
        budget,
        travelCompanions,
        interests,
        itinerary: itinerary.itinerary,
        destinationImage: destinationImage || undefined,
        destinationOverview: destinationOverview?.destinationOverview,
        youMightWantToAsk: destinationOverview?.youMightWantToAsk,
        bestTimeToVisit: destinationOverview?.bestTimeToVisit,
        hiddenGems: destinationOverview?.hiddenGems,
        localExperiences: destinationOverview?.localExperiences,
        foodAndDining: destinationOverview?.foodAndDining,
        createdAt: now,
        updatedAt: now,
      };

      // Add to array
      savedItineraries.push(newItinerary);

      // Save to file
      fs.writeFileSync(filePath, JSON.stringify(savedItineraries, null, 2));

      // Add the saved ID and title to the response
      enrichedItinerary.savedId = id;
      enrichedItinerary.title = title;
      
      console.log(`Itinerary auto-saved with ID: ${id} and title: ${title} (including destination overview)`);
    } catch (saveError) {
      console.error('Failed to auto-save itinerary:', saveError);
      // Don't fail the request if auto-save fails, just log it
    }

    return NextResponse.json(enrichedItinerary);

  } catch (error) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { error: `Failed to generate itinerary: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
