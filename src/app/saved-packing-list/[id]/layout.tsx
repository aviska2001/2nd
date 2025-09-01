import { Metadata } from 'next';
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

async function getPackingList(id: string): Promise<SavedPackingList | null> {
  try {
    const filePath = path.join(process.cwd(), 'user-data', 'packing-lists', 'saved-packing-lists.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return null;
    }

    // Read and parse the file
    const data = fs.readFileSync(filePath, 'utf8');
    const savedPackingLists: SavedPackingList[] = JSON.parse(data);
    
    // Find the specific packing list
    const packingList = savedPackingLists.find(item => item.id === id);
    
    return packingList || null;
  } catch (error) {
    console.error('Error fetching packing list for metadata:', error);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const packingList = await getPackingList(id);

  if (!packingList) {
    return {
      title: 'Packing List Not Found | AI Travel Packing Assistant',
      description: 'The requested travel packing list could not be found. Browse our collection of AI-generated travel checklists.',
    };
  }

  // Generate meta title in the format: "4-Day Family Packing List for Sri Lanka Kandy - Winter"
  const metaTitle = `${packingList.days}-Day ${packingList.trip_type.charAt(0).toUpperCase() + packingList.trip_type.slice(1)} Packing List for ${packingList.destination} - ${packingList.season.charAt(0).toUpperCase() + packingList.season.slice(1)}`;
  
  const description = `Complete ${packingList.days}-day ${packingList.trip_type} packing checklist for ${packingList.destination} during ${packingList.season} season. AI-generated travel essentials for ${packingList.activities.split(',').slice(0, 3).map(a => a.trim()).join(', ')} and more.`;

  return {
    title: metaTitle,
    description: description,
    keywords: [
      `${packingList.destination} packing list`,
      `${packingList.trip_type} travel checklist`,
      `${packingList.season} packing guide`,
      `${packingList.days} day trip essentials`,
      packingList.destination,
      `${packingList.trip_type} travel`,
      `${packingList.season} travel`,
      'travel packing checklist',
      'AI travel planner',
      'destination packing guide',
      ...packingList.activities.split(',').map(activity => activity.trim().toLowerCase())
    ],
    openGraph: {
      title: metaTitle,
      description: description,
      type: 'article',
      publishedTime: packingList.createdAt,
      modifiedTime: packingList.updatedAt,
      authors: ['AI Travel Packing Assistant'],
      images: packingList.destination_image ? [
        {
          url: packingList.destination_image,
          width: 1200,
          height: 630,
          alt: `${packingList.destination} destination photo - ${metaTitle}`,
        }
      ] : [
        {
          url: '/og-packing-list.jpg',
          width: 1200,
          height: 630,
          alt: metaTitle,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: description,
      images: packingList.destination_image ? [packingList.destination_image] : ['/og-packing-list.jpg'],
    },
    alternates: {
      canonical: `/saved-packing-list/${id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:author': 'AI Travel Packing Assistant',
      'article:published_time': packingList.createdAt,
      'article:modified_time': packingList.updatedAt,
      'article:section': 'Travel Packing',
      'article:tag': [
        packingList.destination,
        packingList.trip_type,
        packingList.season,
        `${packingList.days} days`,
        'travel checklist',
        'packing list'
      ].join(','),
    },
  };
}

export default function SavedPackingListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
