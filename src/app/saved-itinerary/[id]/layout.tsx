import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

interface SavedItinerary {
  id: string;
  title: string;
  destination: string;
  days: string;
  budget: string;
  travelCompanions: string;
  interests: string;
  createdAt: string;
  updatedAt: string;
}

async function getItinerary(id: string): Promise<SavedItinerary | null> {
  try {
    const filePath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return null;
    }

    // Read and parse the file
    const data = fs.readFileSync(filePath, 'utf8');
    const savedItineraries: SavedItinerary[] = JSON.parse(data);
    
    // Find the specific itinerary
    const itinerary = savedItineraries.find(item => item.id === id);
    
    return itinerary || null;
  } catch (error) {
    console.error('Error loading itinerary for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const itinerary = await getItinerary(resolvedParams.id);
  
  if (!itinerary) {
    return {
      title: 'Itinerary Not Found | Travel Planner AI',
      description: 'The requested travel itinerary could not be found.',
    };
  }

  return {
    title: `${itinerary.title} | Travel Planner AI`,
    description: `Your ${itinerary.days}-day travel itinerary for ${itinerary.destination}. Created with Travel Planner AI.`,
    openGraph: {
      title: itinerary.title,
      description: `${itinerary.days}-day travel itinerary for ${itinerary.destination}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: itinerary.title,
      description: `${itinerary.days}-day travel itinerary for ${itinerary.destination}`,
    },
  };
}

export default function SavedItineraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
