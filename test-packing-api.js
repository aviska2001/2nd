async function testPackingAPI() {
  try {
    console.log('Testing packing list API...');
    
    const response = await fetch('http://localhost:3002/api/generate-packing-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'Tokyo, Japan',
        days: '7',
        season: 'summer',
        trip_type: 'leisure',
        activities: 'Sightseeing, Museums, Dining'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log('Success! API returned:', JSON.stringify(jsonData, null, 2));
    } else {
      console.error('API Error:', data);
    }
  } catch (error) {
    console.error('Network/Parse Error:', error.message);
  }
}

testPackingAPI();
