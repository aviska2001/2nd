import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Packing list ID is required' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'user-data', 'packing-lists', 'saved-packing-lists.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'No saved packing lists found' },
        { status: 404 }
      );
    }

    // Read and parse the file
    const data = fs.readFileSync(filePath, 'utf8');
    const savedPackingLists: SavedPackingList[] = JSON.parse(data);
    
    // Find the specific packing list
    const packingList = savedPackingLists.find(item => item.id === id);
    
    if (!packingList) {
      return NextResponse.json(
        { error: 'Packing list not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(packingList);

  } catch (error) {
    console.error('Error reading packing list:', error);
    return NextResponse.json(
      { error: 'Failed to load packing list' },
      { status: 500 }
    );
  }
}
