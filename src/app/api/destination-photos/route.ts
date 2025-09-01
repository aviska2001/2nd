import { NextRequest, NextResponse } from 'next/server';

// Handle CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Add caching headers for images
  response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // 1 hour browser, 2 hours CDN
  return response;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response);
}

// GET handler - Fetch destination photos from Pexels API
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const destination = url.searchParams.get('destination');
    
    if (!destination) {
      const response = NextResponse.json(
        { success: false, error: 'Missing destination parameter' },
        { status: 400 }
      );
      return setCorsHeaders(response);
    }

    const apiKey = process.env.PEXELS_API_KEY || 'RTEhJkBSZhwSPVCC6DCb9MNtHrGSPF9fCTJRCCGF9m5mAprzm1qR7msG';
    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination + ' travel')}&per_page=10`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const errorResponse = NextResponse.json(
        { success: false, error: 'Failed to fetch photos' },
        { status: 500 }
      );
      return setCorsHeaders(errorResponse);
    }

    const data = await response.json();
    const photos = data.photos?.map((photo: { id: number; src: { large: string; medium: string }; alt: string }) => ({
      id: photo.id,
      url: photo.src.large,
      thumb: photo.src.medium,
      alt: photo.alt
    })) || [];

    const successResponse = NextResponse.json({ 
      success: true, 
      photos 
    });
    return setCorsHeaders(successResponse);
  } catch (error) {
    console.error('Error fetching destination photos:', error);
    const errorResponse = NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}