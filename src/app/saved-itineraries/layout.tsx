import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Itineraries | AI Travel Planner - Your Personal Trip Collection',
  description: 'Access and manage your saved travel itineraries created with our AI travel planner. View detailed trip plans, destinations, activities, and travel tips for your upcoming adventures.',
  keywords: [
    'saved itineraries',
    'travel itinerary collection',
    'my travel plans',
    'saved travel itineraries',
    'trip itinerary organizer',
    'travel planning dashboard',
    'destination itineraries',
    'AI travel itineraries',
    'personalized travel plans',
    'vacation itinerary planner',
    'trip planning organizer',
    'travel schedule manager',
    'custom travel itineraries',
    'smart travel planning',
    'destination travel guides',
    'travel itinerary generator',
    'vacation planning tool',
    'travel planning assistant'
  ],
  openGraph: {
    title: 'Saved Itineraries | AI Travel Planner - Your Personal Trip Collection',
    description: 'Access and manage your saved travel itineraries created with our AI travel planner. View detailed trip plans, destinations, activities, and travel tips for your upcoming adventures.',
    type: 'website',
    images: [
      {
        url: '/og-saved-itineraries.jpg',
        width: 1200,
        height: 630,
        alt: 'Saved Itineraries Dashboard - Manage Your AI-Generated Travel Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saved Itineraries | AI Travel Planner - Your Personal Trip Collection',
    description: 'Access and manage your saved travel itineraries created with our AI travel planner. View detailed trip plans, destinations, and travel tips.',
    images: ['/og-saved-itineraries.jpg'],
  },
  alternates: {
    canonical: '/saved-itineraries',
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
};

export default function SavedItinerariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
