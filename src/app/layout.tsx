import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import ErrorBoundary from "../components/ErrorBoundary";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Packing List Generator - AI-Powered Travel Checklist Tool | Free Online",
  description: "Create personalized packing lists in seconds with our AI-powered travel checklist generator. Get destination-specific recommendations, activity-based suggestions, and weather-appropriate items. Free tool trusted by 10,000+ travelers worldwide.",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  keywords: [
    "packing list generator", 
    "travel checklist", 
    "AI packing assistant", 
    "vacation packing list", 
    "travel essentials", 
    "trip planner", 
    "destination packing guide",
    "smart packing tool",
    "travel preparation",
    "packing checklist maker",
    "free packing list",
    "travel planning tool",
    "online packing list generator",
    "personalized travel checklist"
  ],
  authors: [{ name: "Smart Packing List Generator Team" }],
  creator: "Smart Packing List Generator",
  publisher: "Smart Packing List Generator",
  category: "Travel",
  classification: "Travel Planning Tool",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com', // Replace with your actual domain
    title: 'Smart Packing List Generator - AI-Powered Travel Checklist Tool',
    description: 'Create personalized packing lists in seconds with our AI-powered travel checklist generator. Get destination-specific recommendations and never forget essential items again.',
    siteName: 'Smart Packing List Generator',
    images: [
      {
        url: '/og-image.jpg', // Add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'Smart Packing List Generator - AI-Powered Travel Planning Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@your_twitter_handle', // Replace with your Twitter handle
    creator: '@your_twitter_handle', // Replace with your Twitter handle
    title: 'Smart Packing List Generator - AI-Powered Travel Checklist Tool',
    description: 'Create personalized packing lists in seconds with our AI-powered travel checklist generator. Free tool for smart travelers.',
    images: ['/og-image.jpg'], // Add this image to your public folder
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
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
    // bing: 'your-bing-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  other: {
    'google-site-verification': 'your-google-site-verification', // Replace when you have it
    'msvalidate.01': 'your-bing-validation-code', // Replace when you have it
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1746703660454482"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Header />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
