import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Itinerary ID is required' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'No saved itineraries found' },
        { status: 404 }
      );
    }

    // Read and parse the file
    const data = fs.readFileSync(filePath, 'utf8');
    const savedItineraries: SavedItinerary[] = JSON.parse(data);
    
    // Find the specific itinerary
    const itinerary = savedItineraries.find(item => item.id === id);
    
    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(itinerary);

  } catch (error) {
    console.error('Error reading itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to load itinerary' },
      { status: 500 }
    );
  }
}
