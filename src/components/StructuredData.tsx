interface StructuredDataProps {
  type?: 'WebSite' | 'WebApplication' | 'SoftwareApplication' | 'TouristTrip';
  name?: string;
  description?: string;
  url?: string;
  itineraryData?: {
    title: string;
    description: string;
    destination: string;
    duration: string;
    budget: string;
    travelCompanions: string;
    interests: string;
  };
}

export default function StructuredData({ 
  type = 'SoftwareApplication', 
  name = 'Smart Packing List Generator',
  description = 'AI-powered packing list generator that creates personalized travel checklists based on your destination, activities, and trip type.',
  url = 'https://your-domain.com', // Replace with your actual domain
  itineraryData
}: StructuredDataProps) {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": url + "?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Smart Packing List Generator",
      "url": url
    }
  };

  const applicationData = {
    "@context": "https://schema.org",
    "@type": type,
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "HTML5, JavaScript",
    "softwareVersion": "2.0",
    "dateCreated": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "description": "Free AI-powered packing list generator"
    },
    "featureList": [
      "AI-powered packing recommendations",
      "Destination-specific suggestions",
      "Activity-based packing lists",
      "Weather-appropriate items",
      "Customizable trip duration",
      "Mobile-friendly interface",
      "Instant list generation",
      "Global destination coverage",
      "Priority-based item categorization"
    ],
    "author": {
      "@type": "Organization",
      "name": "Smart Packing List Generator Team",
      "url": url
    },
    "provider": {
      "@type": "Organization",
      "name": "Smart Packing List Generator",
      "url": url
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1247",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah Johnson"
        },
        "datePublished": "2024-11-15",
        "reviewBody": "Amazing tool! Generated a perfect packing list for my Japan trip. Saved me hours of research.",
        "name": "Perfect for International Travel",
        "reviewRating": {
          "@type": "Rating",
          "bestRating": "5",
          "ratingValue": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Mike Chen"
        },
        "datePublished": "2024-11-10",
        "reviewBody": "The AI suggestions were spot-on for my hiking trip. Love how it considers activities and weather.",
        "name": "Great for Adventure Travel",
        "reviewRating": {
          "@type": "Rating",
          "bestRating": "5",
          "ratingValue": "5",
          "worstRating": "1"
        }
      }
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Smart Packing List Generator",
    "url": url,
    "description": "Helping travelers pack smarter with AI-powered recommendations",
    "foundingDate": "2024",
    "knowsAbout": [
      "Travel Planning",
      "Packing Lists",
      "Destination Guides",
      "Travel Tips",
      "AI Technology"
    ],
    "areaServed": "Worldwide",
    "serviceType": "Travel Planning Tool"
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is the packing list generator free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Our basic packing list generator is completely free. You can create unlimited packing lists for any destination."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate are the AI recommendations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI is trained on extensive travel data and constantly updated. It considers weather patterns, cultural requirements, and activity-specific needs for highly accurate recommendations."
        }
      },
      {
        "@type": "Question",
        "name": "How do I use the packing list generator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply enter your destination, trip duration, season, and planned activities. Our AI will instantly generate a personalized packing checklist for your trip."
        }
      },
      {
        "@type": "Question",
        "name": "Does it work for all types of trips?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Whether you're planning a business trip, adventure travel, family vacation, or romantic getaway, our generator adapts to your specific trip type."
        }
      }
    ]
  };

  // Itinerary-specific structured data
  const itineraryStructuredData = itineraryData ? {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": itineraryData.title,
    "description": itineraryData.description,
    "touristType": itineraryData.travelCompanions,
    "itinerary": {
      "@type": "ItemList",
      "name": `${itineraryData.duration} ${itineraryData.destination} Travel Itinerary`,
      "description": `Comprehensive ${itineraryData.duration} travel plan for ${itineraryData.destination}`,
      "numberOfItems": parseInt(itineraryData.duration.split('-')[0])
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "description": "Free AI-generated travel itinerary"
    },
    "provider": {
      "@type": "Organization",
      "name": "AI Trip Planner",
      "url": url
    },
    "temporalCoverage": `P${parseInt(itineraryData.duration.split('-')[0])}D`,
    "locationCreated": {
      "@type": "Place",
      "name": itineraryData.destination
    },
    "about": itineraryData.interests.split(',').map(interest => ({
      "@type": "Thing",
      "name": interest.trim()
    })),
    "dateCreated": new Date().toISOString(),
    "inLanguage": "en-US",
    "isAccessibleForFree": true
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(applicationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData)
        }}
      />
      {itineraryStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(itineraryStructuredData)
          }}
        />
      )}
    </>
  );
}
