// Test script to verify auto-save functionality for itinerary generation
const fs = require('fs');
const path = require('path');

async function testAutoSave() {
  console.log('Testing auto-save functionality...');
  
  // Check if there are any saved itineraries before the test
  const userDataDir = path.join(__dirname, 'user-data', 'itineraries');
  const filePath = path.join(userDataDir, 'saved-itineraries.json');
  
  let initialCount = 0;
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const savedItineraries = JSON.parse(data);
      initialCount = savedItineraries.length;
      console.log(`Initial number of saved itineraries: ${initialCount}`);
    } catch (error) {
      console.log('No valid saved itineraries file found');
    }
  } else {
    console.log('No saved itineraries file found yet');
  }

  // Test data
  const testData = {
    destination: "Paris",
    days: "3",
    budget: "Mid-range comfort ($100-300 per day)",
    travelCompanions: "couple",
    interests: "museums, local cuisine, photography spots"
  };

  try {
    console.log('Sending request to generate-itinerary API...');
    const response = await fetch('http://localhost:3002/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response received');
    
    // Check if the response includes savedId and title
    if (result.savedId) {
      console.log(`✅ Auto-save successful! Saved ID: ${result.savedId}`);
      console.log(`✅ Generated title: ${result.title}`);
    } else {
      console.log('❌ Auto-save failed - no savedId in response');
    }

    // Verify the file was updated
    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        const savedItineraries = JSON.parse(data);
        const finalCount = savedItineraries.length;
        
        if (finalCount > initialCount) {
          console.log(`✅ File updated successfully! New count: ${finalCount}`);
          
          // Find the most recent itinerary
          const latestItinerary = savedItineraries[savedItineraries.length - 1];
          console.log(`✅ Latest itinerary title: ${latestItinerary.title}`);
          console.log(`✅ Latest itinerary ID: ${latestItinerary.id}`);
          
          // Check if destination overview data is saved
          if (latestItinerary.destinationOverview) {
            console.log(`✅ Destination Overview saved: ${latestItinerary.destinationOverview.substring(0, 100)}...`);
          } else {
            console.log(`❌ Destination Overview not saved`);
          }
          
          if (latestItinerary.youMightWantToAsk && latestItinerary.youMightWantToAsk.length > 0) {
            console.log(`✅ You Might Want to Ask saved: ${latestItinerary.youMightWantToAsk.length} questions`);
          } else {
            console.log(`❌ You Might Want to Ask not saved`);
          }
          
          if (latestItinerary.bestTimeToVisit) {
            console.log(`✅ Best Time to Visit saved: ${latestItinerary.bestTimeToVisit}`);
          } else {
            console.log(`❌ Best Time to Visit not saved`);
          }
          
          if (latestItinerary.hiddenGems && latestItinerary.hiddenGems.length > 0) {
            console.log(`✅ Hidden Gems saved: ${latestItinerary.hiddenGems.length} gems`);
          } else {
            console.log(`❌ Hidden Gems not saved`);
          }
          
          if (latestItinerary.localExperiences && latestItinerary.localExperiences.length > 0) {
            console.log(`✅ Local Experiences saved: ${latestItinerary.localExperiences.length} experiences`);
          } else {
            console.log(`❌ Local Experiences not saved`);
          }
          
          if (latestItinerary.foodAndDining && latestItinerary.foodAndDining.length > 0) {
            console.log(`✅ Food & Dining saved: ${latestItinerary.foodAndDining.length} options`);
          } else {
            console.log(`❌ Food & Dining not saved`);
          }
        } else {
          console.log('❌ File was not updated with new itinerary');
        }
      } catch (error) {
        console.log('❌ Error reading updated file:', error.message);
      }
    } else {
      console.log('❌ Saved itineraries file was not created');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAutoSave();
