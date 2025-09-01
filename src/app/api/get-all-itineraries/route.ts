import { NextResponse } from 'next/server';
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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }

    // Read and parse the file
    const data = fs.readFileSync(filePath, 'utf8');
    const savedItineraries: SavedItinerary[] = JSON.parse(data);
    
    // Sort by creation date (newest first)
    savedItineraries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(savedItineraries);

  } catch (error) {
    console.error('Error reading saved itineraries:', error);
    return NextResponse.json(
      { error: 'Failed to load saved itineraries' },
      { status: 500 }
    );
  }
}
