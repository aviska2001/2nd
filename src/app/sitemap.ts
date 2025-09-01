import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

interface PackingList {
  id: string;
  title: string;
  updatedAt: string;
}

interface Itinerary {
  id: string;
  title: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/free-packing-list-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/free-travel-planner-ai`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/saved-packing-lists`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/saved-itineraries`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic packing list pages
  let packingListPages: MetadataRoute.Sitemap = [];
  
  try {
    const packingListsPath = path.join(process.cwd(), 'user-data', 'packing-lists', 'saved-packing-lists.json');
    const packingListsData = fs.readFileSync(packingListsPath, 'utf8');
    const packingLists: PackingList[] = JSON.parse(packingListsData);
    
    packingListPages = packingLists.map((packingList) => ({
      url: `${baseUrl}/saved-packing-list/${packingList.id}`,
      lastModified: new Date(packingList.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error reading packing lists data:', error);
  }

  // Dynamic itinerary pages
  let itineraryPages: MetadataRoute.Sitemap = [];
  
  try {
    const itinerariesPath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    const itinerariesData = fs.readFileSync(itinerariesPath, 'utf8');
    const itineraries: Itinerary[] = JSON.parse(itinerariesData);
    
    itineraryPages = itineraries.map((itinerary) => ({
      url: `${baseUrl}/saved-itinerary/${itinerary.id}`,
      lastModified: new Date(itinerary.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error reading itineraries data:', error);
  }

  return [...staticPages, ...packingListPages, ...itineraryPages];
}
