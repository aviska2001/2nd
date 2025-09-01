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

export async function POST(request: NextRequest) {
  try {
    const { 
      destination, 
      days, 
      season, 
      trip_type, 
      activities, 
      packing_list, 
      packing_tips, 
      destination_notes,
      destination_details,
      faqs,
      destination_image
    } = await request.json();

    // Validate required fields
    if (!destination || !days || !season || !trip_type || !packing_list) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Create user-data directory if it doesn't exist
    const userDataDir = path.join(process.cwd(), 'user-data', 'packing-lists');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const filePath = path.join(userDataDir, 'saved-packing-lists.json');
    
    // Read existing packing lists or create empty array
    let savedPackingLists: SavedPackingList[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        savedPackingLists = JSON.parse(data);
      } catch (error) {
        console.error('Error reading saved packing lists:', error);
        savedPackingLists = [];
      }
    }

    // Generate sequential ID starting from 1
    const getNextId = () => {
      if (savedPackingLists.length === 0) {
        return '1';
      }
      
      // Find the highest existing numeric ID
      const numericIds = savedPackingLists
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

    // Generate a descriptive title
    const title = `${destination} - ${days} Day ${trip_type.charAt(0).toUpperCase() + trip_type.slice(1)} Trip (${season.charAt(0).toUpperCase() + season.slice(1)})`;

    // Create new packing list object
    const newPackingList: SavedPackingList = {
      id,
      title,
      destination,
      days,
      season,
      trip_type,
      activities,
      packing_list,
      packing_tips: packing_tips || [],
      destination_notes: destination_notes || '',
      destination_details,
      faqs,
      destination_image,
      createdAt: now,
      updatedAt: now,
    };

    // Add to array
    savedPackingLists.push(newPackingList);

    // Save to file
    fs.writeFileSync(filePath, JSON.stringify(savedPackingLists, null, 2));

    return NextResponse.json({ success: true, id });

  } catch (error) {
    console.error('Error saving packing list:', error);
    return NextResponse.json(
      { error: 'Failed to save packing list' },
      { status: 500 }
    );
  }
}
