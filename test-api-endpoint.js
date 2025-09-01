const fetch = require('node-fetch');

async function testItineraryAPI() {
  try {
    console.log('Testing itinerary API...');
    
    const response = await fetch('http://localhost:3000/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'Paris',
        days: '3',
        budget: 'medium',
        travelCompanions: 'solo',
        interests: 'culture'
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testItineraryAPI();
