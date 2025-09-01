import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'user-data', 'packing-lists', 'saved-packing-lists.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }

    // Read and parse the file
    const data = fs.readFileSync(filePath, 'utf8');
    const savedPackingLists: SavedPackingList[] = JSON.parse(data);
    
    // Sort by creation date (newest first)
    savedPackingLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(savedPackingLists);

  } catch (error) {
    console.error('Error reading saved packing lists:', error);
    return NextResponse.json(
      { error: 'Failed to load saved packing lists' },
      { status: 500 }
    );
  }
}
