import { NextRequest, NextResponse } from 'next/server';

function buildFallbackOverview(destination: string) {
  const dest = destination || 'your destination';
  return {
    destinationOverview: `${dest} offers a mix of iconic sights, local culture, and memorable experiences. Explore landmark attractions, stroll vibrant neighborhoods, discover hidden gems, and taste regional flavors. Plan time for museums, parks, scenic viewpoints, markets, and authentic eateries. Balance busy sightseeing with relaxing moments in cafes or along waterfronts. Public transport and walkable areas make getting around easy. You’ll find options for families, couples, solo travelers, and groups across different budgets and interests.`,
    youMightWantToAsk: [
      { question: 'How to get around?', answer: 'Combine public transit, walking, and occasional rideshares or taxis. Consider transit passes or city cards for savings and convenience during your stay.' },
      { question: 'Typical daily budget?', answer: 'Plan a budget that fits your style—from street food and hostels to fine dining and boutique hotels. Attractions often have discounts and free days.' },
      { question: 'Any safety tips?', answer: 'Stay aware of your surroundings, keep valuables secure, and use licensed transport. Learn basic local etiquette and emergency numbers before you go.' },
      { question: 'Do I need reservations?', answer: 'Book popular attractions, restaurants, and special tours in advance—especially on weekends and during peak seasons to avoid long waits.' },
      { question: 'What to pack?', answer: 'Pack comfortable walking shoes, weather-appropriate clothes, and essentials like chargers, medications, and copies of important documents.' }
    ],
    bestTimeToVisit: 'Spring and fall offer pleasant weather, fewer crowds, and reasonable prices for most activities.',
    hiddenGems: [
      { name: 'Neighborhood Cafe Lane', description: 'Quiet alleyway of indie cafes and bakeries frequented by locals for brunch and conversations.' },
      { name: 'Community Art Space', description: 'Small gallery and workshop hosting rotating exhibits and evening cultural meetups.' },
      { name: 'Riverside Boardwalk Nook', description: 'Secluded bench spots perfect for reading, people-watching, and sunset photos along the water.' },
      { name: 'Local Designer Shops', description: 'Boutiques featuring handmade goods, sustainable fashion, and unique souvenirs off the main drag.' },
      { name: 'Pocket Park Pavilion', description: 'Tiny green retreat with sculptures and lunchtime food trucks popular with office workers.' }
    ],
    localExperiences: [
      { name: 'Market-to-Table Walk', description: 'Join a local for a market tour and tasting, learning ingredients, recipes, and culinary traditions.' },
      { name: 'Neighborhood Photo Stroll', description: 'Capture street scenes, hidden murals, and classic architecture with route tips for golden-hour shots.' },
      { name: 'Craft Workshop', description: 'Hands-on session with artisans to create a small keepsake reflecting regional craftsmanship.' },
      { name: 'Evening Food Crawl', description: 'Sample small plates across several eateries while hearing stories about the neighborhood.' },
      { name: 'Park Fitness or Yoga', description: 'Morning class in a scenic park to energize your day and meet like-minded travelers.' }
    ],
    foodAndDining: [
      { name: 'Signature Street Snack', description: 'Beloved grab-and-go treat showcasing regional flavors and spices—cheap, quick, and tasty.' },
      { name: 'Traditional Set Menu', description: 'Home-style dishes served in a cozy setting, ideal for sampling local comfort food.' },
      { name: 'Seafood/Grill House', description: 'Fresh catches or grilled specialties with seasonal sides and hearty portions.' },
      { name: 'Vegetarian Bistro', description: 'Plant-forward plates using market produce with creative sauces and wholesome grains.' },
      { name: 'Dessert Parlor', description: 'Classic sweets, pastries, and coffee after a day of sightseeing—great late-night stop.' }
    ]
  };
}

function robustJsonParse(text: string) {
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const slice = cleaned.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error('Invalid JSON from model');
  }
}

async function generateDestinationOverviewWithGemini(destination: string) {
  const prompt = `Generate a comprehensive destination overview for ${destination}. 

Provide the following sections:
1. Destination Overview: A 100-word description of what makes this destination special
2. You Might Want to Ask: 5 common questions travelers ask about this destination with short answers
3. Best Time to Visit: A brief 20-word summary of the optimal time to visit
4. Hidden Gems: 5 lesser-known places worth visiting
5. Local Experiences: 5 unique cultural experiences
6. Food & Dining: 5 must-try local dishes and restaurant types

Return a structured JSON object:
{
  "destinationOverview": "100-word overview of the destination highlighting its unique features, culture, and appeal",
  "youMightWantToAsk": [
    {
      "question": "Question 1 about practical travel information?",
      "answer": "Short 30-word answer providing practical information"
    },
    {
      "question": "Question 2 about local customs?",
      "answer": "Short 30-word answer about local customs and traditions"
    },
    {
      "question": "Question 3 about transportation?",
      "answer": "Short 30-word answer about getting around and transport options"
    },
    {
      "question": "Question 4 about budget considerations?",
      "answer": "Short 30-word answer about typical costs and budget planning"
    },
    {
      "question": "Question 5 about activities?",
      "answer": "Short 30-word answer about recommended activities and experiences"
    }
  ],
  "bestTimeToVisit": "20-word summary of the optimal time to visit this destination",
  "hiddenGems": [
    {
      "name": "Hidden Gem Name",
      "description": "25-word description of this lesser-known spot"
    }
  ],
  "localExperiences": [
    {
      "name": "Experience Name",
      "description": "30-word description of this unique cultural experience"
    }
  ],
  "foodAndDining": [
    {
      "name": "Dish/Restaurant Type",
      "description": "25-word description of this culinary experience"
    }
  ]
}

Ensure:
- All information is accurate and up-to-date
- Descriptions are engaging and informative
- Include both popular and authentic local experiences
- Consider different types of travelers (families, couples, solo, adventure seekers)
- The JSON is clean, valid, and follows the exact structure`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an expert travel advisor with deep knowledge of global destinations. Always respond with valid JSON only, no additional text or formatting.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url: response.url
    });
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
    console.error('Invalid Gemini API response structure:', data);
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();

    // Validate required fields
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    // Check if we have valid Gemini API key
    const hasValidGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '';
    
    if (!hasValidGeminiKey) {
      // Graceful fallback so the UI still shows useful content
      const fallback = buildFallbackOverview(destination);
      return NextResponse.json(fallback);
    }

    // Use Gemini API
    let overviewText: string;
    try {
      console.log('Generating destination overview with Gemini API...');
      overviewText = await generateDestinationOverviewWithGemini(destination);
    } catch (geminiError) {
      console.error('Gemini API failed:', geminiError);
      return NextResponse.json(
        { error: 'Gemini API failed. Please check your API key and try again.' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let destinationData;
    try {
      destinationData = robustJsonParse(overviewText);
    } catch (parseError) {
      console.error('Failed to parse AI response for destination overview:', parseError);
      console.error('Raw response:', overviewText);
      // Fallback to local template on parse failure
      const fallback = buildFallbackOverview(destination);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(destinationData);

  } catch (error) {
    console.error('Error generating destination overview:', error);
    return NextResponse.json(
      { error: `Failed to generate destination overview: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
