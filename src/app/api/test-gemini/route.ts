import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  return NextResponse.json({
    success: true,
    hasGeminiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyValid: apiKey && apiKey.startsWith('AIza'),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || !apiKey.startsWith('AIza')) {
      return NextResponse.json({
        error: 'Gemini API key not configured properly',
        hasKey: !!apiKey,
        keyStart: apiKey ? apiKey.substring(0, 10) : 'undefined'
      }, { status: 400 });
    }

    // Test the Gemini API with a simple request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Say hello in JSON format: {\"message\": \"hello\"}"
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        error: 'Gemini API test failed',
        status: response.status,
        statusText: response.statusText,
        errorData
      }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Gemini API is working',
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
