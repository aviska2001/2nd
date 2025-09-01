import { NextRequest, NextResponse } from 'next/server';
import { buildHeuristicPackingResponse, enhanceWithHeuristics, PackingResponse as HeuristicPackingResponse } from '@/lib/packing/logic';

// Types
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

interface PackingResponse {
  packing_list: PackingList;
  packing_tips: string[];
  destination_notes: string;
  destination_details?: DestinationDetails;
  faqs?: FAQItem[];
}

interface ApiResponse {
  packing_data: PackingResponse;
  destination_image: string | null;
  usedStrategy?: 'ai+rules' | 'rules-only' | 'sample-fallback';
}

// Set API Key for Gemini
function getApiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

// Set Prompt for Packing List
function setPrompt(destination: string, days: string, season: string, tripType: string, activities: string): string {
  return `You are a packing assistant. Produce ONLY valid JSON (no prose) following the exact schema below.

Generate a comprehensive packing list for a ${days}-day trip to ${destination} during ${season} season, for a ${tripType} trip focusing on ${activities}.

Guidelines:
1. Consider the destination's climate, culture, and local customs.
2. Include essentials based on trip duration and activities.
3. Suggest quantities for each item when relevant.
4. Include both must-have items and optional/recommended items.
5. Consider seasonal weather conditions and appropriate clothing.
6. Include destination-specific items (adapters, medications, etc.).
7. Organize items by category for easy packing.
8. Target item descriptions to <= 25 words, clear and concrete.

Return a structured JSON object with these fields:
- packing_list: categories for clothing, toiletries, electronics, documents, health_safety, activity_specific, miscellaneous
- packing_tips: array of tips
- destination_notes: string
- destination_details: overview, best_time_to_visit, weather_summary, cultural_tips, local_transport, currency, language, power_plugs, safety_tips
- faqs: array of 5 objects with question and answer

FAQ Guidelines:
- Provide 5 frequently asked questions and answers about travel to ${destination}.
- Cover topics like best time to visit, essentials, cultural tips, currency, and safety.
- Each answer should be concise (max 40 words).

Ensure:
- All items have descriptions within 25 words.
- Items are categorized appropriately.
- Priority levels help users prioritize packing.
- Include destination and activity-specific recommendations.
- Include destination_details as described.
- Include 5 relevant FAQs as described.
- The JSON is clean, valid, and follows the exact structure.

Output: JSON only.`;
}

// Type for validation errors
interface ValidationError {
  error: string;
  message?: string;
}

// Extract and validate JSON
function extractAndValidateJson(textResponse: string): [PackingResponse | null, ValidationError | null] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(textResponse);
    return validateJsonWithModel(parsed);
  } catch {}

  // Fallback: extract the first JSON object with a broader regex and repair trailing commas
  const jsonRegex = /\{[\s\S]*\}/;
  const match = textResponse.match(jsonRegex);
  if (match) {
    let candidate = match[0];
    // Remove trailing commas before } or ]
    candidate = candidate.replace(/,\s*(\]|\})/g, '$1');
    try {
      const jsonObj = JSON.parse(candidate) as PackingResponse;
      return validateJsonWithModel(jsonObj);
    } catch (error) {
      return [null, { error: 'JSON parsing failed', message: (error as Error).message }];
    }
  }
  return [null, { error: 'No valid JSON found in the response' }];
}

// Validate JSON against model
function validateJsonWithModel(jsonData: unknown): [PackingResponse | null, ValidationError | null] {
  if (!jsonData || typeof jsonData !== 'object' || !('packing_list' in jsonData)) {
    return [null, { error: "Invalid packing_list structure" }];
  }

  const data = jsonData as Record<string, unknown>;
  
  if (!data.packing_list || typeof data.packing_list !== 'object') {
    return [null, { error: "Invalid packing_list structure" }];
  }

  const packingList = data.packing_list as Record<string, unknown>;

  const requiredCategories = [
    'clothing', 'toiletries', 'electronics', 'documents', 
    'health_safety', 'activity_specific', 'miscellaneous'
  ];
  
  for (const category of requiredCategories) {
    if (!Array.isArray(packingList[category])) {
      return [null, { error: `Missing or invalid category: ${category}` }];
    }
    // Validate each item in the category
    const categoryItems = packingList[category] as unknown[];
    for (const item of categoryItems) {
      if (!item || typeof item !== 'object') {
        return [null, { error: `Invalid item structure in category: ${category}` }];
      }
      const itemObj = item as Record<string, unknown>;
      if (!itemObj.item || !itemObj.quantity || !itemObj.description || !itemObj.priority) {
        return [null, { error: `Invalid item structure in category: ${category}` }];
      }
    }
  }

  // Validate packing tips
  if (!Array.isArray(data.packing_tips)) {
    return [null, { error: "Invalid packing_tips structure" }];
  }

  // Validate destination notes
  if (typeof data.destination_notes !== 'string') {
    return [null, { error: "Invalid destination_notes structure" }];
  }

  // Validate destination details if present
  if (data.destination_details) {
    const dd = data.destination_details as Record<string, unknown>;
    const fields = [
      'overview', 'best_time_to_visit', 'weather_summary', 'cultural_tips',
      'local_transport', 'currency', 'language', 'power_plugs', 'safety_tips'
    ];
    if (typeof dd !== 'object') {
      return [null, { error: "Invalid destination_details structure" }];
    }
    for (const f of fields) {
      if (typeof dd[f] !== 'string') {
        return [null, { error: `Invalid destination_details field: ${f}` }];
      }
    }
  }

  // Validate faqs if present
  if (data.faqs) {
    if (!Array.isArray(data.faqs) || data.faqs.length < 1) {
      return [null, { error: "Invalid faqs structure" }];
    }
    for (const faq of data.faqs as unknown[]) {
      if (!faq || typeof faq !== 'object') return [null, { error: "Invalid faq item structure" }];
      const faqObj = faq as Record<string, unknown>;
      if (typeof faqObj.question !== 'string' || typeof faqObj.answer !== 'string') {
        return [null, { error: "Invalid faq item fields" }];
      }
    }
  }

  return [data as unknown as PackingResponse, null];
}

// Generate response with Gemini
async function generateResponseWithGemini(prompt: string): Promise<string | { error: string }> {
  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "your_new_api_key_here" || apiKey.trim() === "") {
    console.log('Using fallback sample data due to missing API key');
    return getSamplePackingListResponse();
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    contents: [
      { parts: [{ text: prompt }] }
    ]
  });

  try {
    console.log('Making request to Gemini API...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      if (response.status === 503) {
        console.log('Gemini API unavailable, using fallback data');
        return getSamplePackingListResponse();
      } else if (response.status === 401 || response.status === 403) {
        console.log('Invalid API key, using fallback data');
        return getSamplePackingListResponse();
      } else if (response.status === 429) {
        return { error: 'Rate limit exceeded. Please try again later.' };
      }
      
      console.log('API error, using fallback data');
      return getSamplePackingListResponse();
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid API response structure:', data);
      console.log('Using fallback data due to invalid response structure');
      return getSamplePackingListResponse();
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.log('Using fallback data due to network error');
    return getSamplePackingListResponse();
  }
}

// Sample response for when API is not available
function getSamplePackingListResponse(): string {
  return JSON.stringify({
    "packing_list": {
      "clothing": [
        {
          "item": "Lightweight t-shirts",
          "quantity": "4-5 pieces",
          "description": "Breathable cotton or moisture-wicking fabric for comfort in warm weather",
          "priority": "essential"
        },
        {
          "item": "Comfortable walking shorts",
          "quantity": "2-3 pairs",
          "description": "Quick-dry material ideal for sightseeing and casual activities",
          "priority": "essential"
        },
        {
          "item": "Light sweater or cardigan",
          "quantity": "1 piece",
          "description": "For air-conditioned spaces and cooler evenings",
          "priority": "recommended"
        },
        {
          "item": "Comfortable walking shoes",
          "quantity": "1 pair",
          "description": "Well-broken-in shoes for extensive walking and sightseeing",
          "priority": "essential"
        },
        {
          "item": "Sandals",
          "quantity": "1 pair",
          "description": "For beach, pool, or casual evening wear",
          "priority": "recommended"
        }
      ],
      "toiletries": [
        {
          "item": "Toothbrush and toothpaste",
          "quantity": "1 set",
          "description": "Essential dental hygiene items for daily use",
          "priority": "essential"
        },
        {
          "item": "Sunscreen (SPF 30+)",
          "quantity": "1 bottle",
          "description": "High SPF protection for outdoor activities and sun exposure",
          "priority": "essential"
        },
        {
          "item": "Shampoo and conditioner",
          "quantity": "Travel size",
          "description": "Personal hair care products in airline-friendly sizes",
          "priority": "essential"
        },
        {
          "item": "Deodorant",
          "quantity": "1 piece",
          "description": "Essential for personal hygiene during travel",
          "priority": "essential"
        }
      ],
      "electronics": [
        {
          "item": "Phone charger",
          "quantity": "1 piece",
          "description": "Essential for staying connected and using travel apps",
          "priority": "essential"
        },
        {
          "item": "Universal power adapter",
          "quantity": "1 piece",
          "description": "For charging devices in different countries",
          "priority": "essential"
        },
        {
          "item": "Portable power bank",
          "quantity": "1 piece",
          "description": "Backup power for long sightseeing days",
          "priority": "recommended"
        },
        {
          "item": "Camera",
          "quantity": "1 piece",
          "description": "For capturing travel memories and experiences",
          "priority": "recommended"
        }
      ],
      "documents": [
        {
          "item": "Passport",
          "quantity": "1 piece",
          "description": "Essential travel document for international travel",
          "priority": "essential"
        },
        {
          "item": "Travel insurance documents",
          "quantity": "1 set",
          "description": "Important coverage for medical emergencies and trip disruptions",
          "priority": "essential"
        },
        {
          "item": "Flight tickets",
          "quantity": "1 set",
          "description": "Printed or digital copies of flight confirmations",
          "priority": "essential"
        },
        {
          "item": "Hotel reservations",
          "quantity": "1 set",
          "description": "Confirmation documents for accommodation bookings",
          "priority": "essential"
        }
      ],
      "health_safety": [
        {
          "item": "First aid kit",
          "quantity": "1 small kit",
          "description": "Basic medical supplies for minor injuries and ailments",
          "priority": "recommended"
        },
        {
          "item": "Personal medications",
          "quantity": "As needed",
          "description": "All prescription and over-the-counter medications you regularly take",
          "priority": "essential"
        },
        {
          "item": "Hand sanitizer",
          "quantity": "1 small bottle",
          "description": "For maintaining hygiene when soap and water unavailable",
          "priority": "recommended"
        }
      ],
      "activity_specific": [
        {
          "item": "Guidebook or travel app",
          "quantity": "1 piece",
          "description": "For discovering attractions, restaurants, and local insights",
          "priority": "recommended"
        },
        {
          "item": "Comfortable day pack",
          "quantity": "1 piece",
          "description": "For carrying essentials during sightseeing and day trips",
          "priority": "recommended"
        },
        {
          "item": "Water bottle",
          "quantity": "1 piece",
          "description": "Reusable bottle for staying hydrated during activities",
          "priority": "recommended"
        }
      ],
      "miscellaneous": [
        {
          "item": "Travel pillow",
          "quantity": "1 piece",
          "description": "For comfort during long flights and travel",
          "priority": "optional"
        },
        {
          "item": "Laundry detergent packets",
          "quantity": "2-3 packets",
          "description": "For washing clothes during extended trips",
          "priority": "optional"
        },
        {
          "item": "Snacks",
          "quantity": "As desired",
          "description": "Familiar comfort foods for travel days and emergencies",
          "priority": "optional"
        }
      ]
    },
    "packing_tips": [
      "Roll clothes instead of folding to save space and reduce wrinkles",
      "Pack versatile items that can be mixed and matched for different occasions",
      "Keep essentials like medications and important documents in your carry-on bag"
    ],
    "destination_notes": "This is a sample packing list. For personalized recommendations, please configure your Gemini API key.",
    "destination_details": {
      "overview": "Vibrant city with rich culture, great food, and efficient transport.",
      "best_time_to_visit": "Spring and autumn for mild weather and fewer crowds.",
      "weather_summary": "Warm days, cooler evenings; occasional showers possible.",
      "cultural_tips": "Be polite, queue orderly, and respect local customs.",
      "local_transport": "Metro and buses are fast, safe, and affordable.",
      "currency": "Local currency; cards widely accepted.",
      "language": "Local language; basic phrases appreciated.",
      "power_plugs": "Type A/B 110-120V or local equivalent.",
      "safety_tips": "Stay aware in crowds; use licensed taxis at night."
    }
  });
}

// Fetch destination image from Pexels API
async function fetchDestinationImage(destination: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY || 'RTEhJkBSZhwSPVCC6DCb9MNtHrGSPF9fCTJRCCGF9m5mAprzm1qR7msG';
  const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination + ' travel')}&per_page=1`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.photos?.[0]?.src?.large) {
      return data.photos[0].src.large;
    }

    return null;
  } catch (error) {
    console.error('Error fetching destination image:', error);
    return null;
  }
}

// Handle CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    console.log('Received packing list request');
    const body = await request.json();
    console.log('Request data:', body);
    
    // Validate required fields
    const requiredFields = ['destination', 'days', 'season', 'trip_type', 'activities'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`Missing required field: ${field}`);
        const response = NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
        return setCorsHeaders(response);
      }
    }

  const prompt = setPrompt(
      body.destination,
      body.days,
      body.season,
      body.trip_type,
      body.activities
    );

    console.log('Generated prompt length:', prompt.length);
    const geminiResponse = await generateResponseWithGemini(prompt);

    if (typeof geminiResponse === 'object' && geminiResponse.error) {
      console.error('Gemini API error:', geminiResponse.error);
      const response = NextResponse.json(
        { success: false, error: geminiResponse.error },
        { status: 500 }
      );
      return setCorsHeaders(response);
    }

    console.log('Extracting and validating JSON response...');
    const [validatedData, validationErrors] = extractAndValidateJson(geminiResponse as string);

    console.log('Fetching destination image...');
    const destinationImage = await fetchDestinationImage(body.destination);

    // Build generator input for heuristics
    const genInput = {
      destination: String(body.destination),
      days: Number(body.days),
      season: String(body.season).toLowerCase() as 'spring' | 'summer' | 'autumn' | 'winter',
      trip_type: String(body.trip_type),
      activities: String(body.activities || ''),
    };

    let packingData: PackingResponse;
    let usedStrategy: ApiResponse['usedStrategy'] = 'sample-fallback';

    if (validatedData) {
      // Enhance AI output with deterministic rules
      packingData = enhanceWithHeuristics(validatedData as HeuristicPackingResponse, genInput);
      usedStrategy = 'ai+rules';
    } else {
      console.warn('AI JSON invalid, falling back to rules-only. Details:', validationErrors);
      packingData = buildHeuristicPackingResponse(genInput);
      usedStrategy = 'rules-only';
    }

    // If no faqs, generate 5 default destination-related FAQs
    let faqs: FAQItem[] | undefined = packingData.faqs;
    if (!faqs || faqs.length < 5) {
      const destination = genInput.destination;
      faqs = [
        {
          question: `What is the best time to visit ${destination}?`,
          answer: packingData.destination_details?.best_time_to_visit || 'Check local climate and events for the best time.'
        },
        {
          question: `What are the must-pack essentials for ${destination}?`,
          answer: 'Essentials include passport, weather-appropriate clothing, chargers, and any destination-specific items.'
        },
        {
          question: `Are there any cultural tips for travelers to ${destination}?`,
          answer: packingData.destination_details?.cultural_tips || 'Respect local customs and etiquette.'
        },
        {
          question: `What is the local currency and how should I handle money in ${destination}?`,
          answer: packingData.destination_details?.currency || 'Check the local currency and consider carrying some cash.'
        },
        {
          question: `Is it safe to travel to ${destination}?`,
          answer: packingData.destination_details?.safety_tips || 'Follow general safety precautions and stay aware of your surroundings.'
        }
      ];
      packingData.faqs = faqs;
    }

    const responseData: ApiResponse = {
      packing_data: packingData,
      destination_image: destinationImage,
      usedStrategy,
    };

    const response = NextResponse.json({ success: true, data: responseData });
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Unhandled error in POST handler:', error);
    const response = NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
    return setCorsHeaders(response);
  }
}
