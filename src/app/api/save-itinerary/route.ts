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

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      destination, 
      days, 
      budget, 
      travelCompanions, 
      interests, 
      itinerary, 
      destinationImage,
      destinationOverview,
      youMightWantToAsk,
      bestTimeToVisit,
      hiddenGems,
      localExperiences,
      foodAndDining
    } = await request.json();

    // Validate required fields
    if (!title || !destination || !days || !budget || !travelCompanions || !interests || !itinerary) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create user-data directory if it doesn't exist
    const userDataDir = path.join(process.cwd(), 'user-data', 'itineraries');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const filePath = path.join(userDataDir, 'saved-itineraries.json');
    
    // Read existing itineraries or create empty array
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

    // Create new itinerary object
    const newItinerary: SavedItinerary = {
      id,
      title,
      destination,
      days,
      budget,
      travelCompanions,
      interests,
      itinerary,
      destinationImage,
      destinationOverview,
      youMightWantToAsk,
      bestTimeToVisit,
      hiddenGems,
      localExperiences,
      foodAndDining,
      createdAt: now,
      updatedAt: now,
    };

    // Add to array
    savedItineraries.push(newItinerary);

    // Save to file
    fs.writeFileSync(filePath, JSON.stringify(savedItineraries, null, 2));

    return NextResponse.json({ success: true, id });

  } catch (error) {
    console.error('Error saving itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to save itinerary' },
      { status: 500 }
    );
  }
}
