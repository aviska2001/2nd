import { NextResponse } from 'next/server';

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  
  return NextResponse.json({
    hasGeminiKey: !!geminiKey,
    keyLength: geminiKey ? geminiKey.length : 0,
    keyStart: geminiKey ? geminiKey.substring(0, 10) + '...' : null,
    isDefined: geminiKey !== undefined,
    isEmpty: geminiKey === '',
    isValidationKey: geminiKey === 'your_new_api_key_here',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('GEMINI'))
  });
}
