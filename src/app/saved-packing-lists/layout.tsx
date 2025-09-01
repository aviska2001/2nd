import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Packing Lists | Smart Travel Packing Made Easy',
  description: 'Create, save, and reuse smart packing lists for any trip. Stay organized and stress-free with personalized travel packing checklists.',
  keywords: [
    'saved packing lists',
    'travel checklist collection',
    'my packing lists',
    'saved travel checklists',
    'packing list organizer',
    'travel planning dashboard',
    'destination packing lists',
    'activity-based packing lists',
    'seasonal travel checklists',
    'personalized travel essentials',
    'trip packing organizer',
    'travel preparation tools',
    'smart packing lists',
    'AI travel planning',
    'destination travel guides'
  ],
  openGraph: {
    title: 'Saved Packing Lists | Smart Travel Packing Made Easy',
    description: 'Create, save, and reuse smart packing lists for any trip. Stay organized and stress-free with personalized travel packing checklists.',
    type: 'website',
    images: [
      {
        url: '/og-saved-packing-lists.jpg',
        width: 1200,
        height: 630,
        alt: 'Saved Packing Lists Dashboard - Organize Your Travel Checklists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saved Packing Lists | Smart Travel Packing Made Easy',
    description: 'Create, save, and reuse smart packing lists for any trip. Stay organized and stress-free with personalized travel packing checklists.',
    images: ['/og-saved-packing-lists.jpg'],
  },
  alternates: {
    canonical: '/saved-packing-lists',
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

export default function SavedPackingListsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
