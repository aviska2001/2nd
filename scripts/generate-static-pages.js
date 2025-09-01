const fs = require('fs');
const path = require('path');

async function generateStaticPages() {
  try {
    console.log('🚀 Starting static page generation...');
    
    // Generate itinerary static pages
    await generateItineraryStaticPages();
    
    // Generate packing list static pages
    await generatePackingListStaticPages();
    
    console.log('🎉 All static page generation completed!');
    
  } catch (error) {
    console.error('❌ Error generating static pages:', error);
  }
}

async function generateItineraryStaticPages() {
  try {
    console.log('📋 Generating itinerary static pages...');
    
    // Read saved itineraries
    const filePath = path.join(process.cwd(), 'user-data', 'itineraries', 'saved-itineraries.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ No saved itineraries found');
      return;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const savedItineraries = JSON.parse(data);
    
    console.log(`📄 Found ${savedItineraries.length} itineraries to generate static pages for`);

    // Create static directory if it doesn't exist
    const staticDir = path.join(process.cwd(), 'static-pages');
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }

    const itinerariesDir = path.join(staticDir, 'saved-itinerary');
    if (!fs.existsSync(itinerariesDir)) {
      fs.mkdirSync(itinerariesDir, { recursive: true });
    }

    // Generate pages for each itinerary
    for (const itinerary of savedItineraries) {
      const itineraryDir = path.join(itinerariesDir, itinerary.id);
      if (!fs.existsSync(itineraryDir)) {
        fs.mkdirSync(itineraryDir, { recursive: true });
      }

      // Create a simple HTML file with the itinerary data
      const htmlContent = generateHTMLContent(itinerary);
      const htmlPath = path.join(itineraryDir, 'index.html');
      
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ Generated static page for itinerary ID: ${itinerary.id}`);
    }

    // Generate index file with all itineraries
    const indexContent = generateIndexHTML(savedItineraries);
    fs.writeFileSync(path.join(staticDir, 'index.html'), indexContent);
    
    console.log('✅ Itinerary static page generation completed!');
    
  } catch (error) {
    console.error('❌ Error generating itinerary static pages:', error);
  }
}

async function generatePackingListStaticPages() {
  try {
    console.log('🎒 Generating packing list static pages...');
    
    // Read saved packing lists
    const filePath = path.join(process.cwd(), 'user-data', 'packing-lists', 'saved-packing-lists.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ No saved packing lists found');
      return;
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const savedPackingLists = JSON.parse(data);
    
    console.log(`� Found ${savedPackingLists.length} packing lists to generate static pages for`);

    // Create static directory if it doesn't exist
    const staticDir = path.join(process.cwd(), 'static-pages');
    if (!fs.existsSync(staticDir)) {
      fs.mkdirSync(staticDir, { recursive: true });
    }

    const packingListsDir = path.join(staticDir, 'saved-packing-list');
    if (!fs.existsSync(packingListsDir)) {
      fs.mkdirSync(packingListsDir, { recursive: true });
    }

    // Generate pages for each packing list
    for (const packingList of savedPackingLists) {
      const packingListDir = path.join(packingListsDir, packingList.id);
      if (!fs.existsSync(packingListDir)) {
        fs.mkdirSync(packingListDir, { recursive: true });
      }

      // Create a simple HTML file with the packing list data
      const htmlContent = generatePackingListHTMLContent(packingList);
      const htmlPath = path.join(packingListDir, 'index.html');
      
      fs.writeFileSync(htmlPath, htmlContent);
      console.log(`✅ Generated static page for packing list ID: ${packingList.id}`);
    }

    // Generate index file with all packing lists
    const indexContent = generatePackingListIndexHTML(savedPackingLists);
    fs.writeFileSync(path.join(staticDir, 'saved-packing-lists.html'), indexContent);
    
    console.log('✅ Packing list static page generation completed!');
    
  } catch (error) {
    console.error('❌ Error generating packing list static pages:', error);
  }
}

function generateHTMLContent(itinerary) {
  const calculateTripBudget = (itinerary, budget, days, travelCompanions) => {
    // Simplified budget calculation for static generation
    const budgetMap = {
      'Budget-friendly ($50-100/day)': 75,
      'Mid-range ($150-300/day)': 225,
      'Luxury ($400-800/day)': 600,
      'Ultra-luxury ($500+/day)': 750
    };
    
    const dailyBudget = budgetMap[budget] || 100;
    const totalBudget = dailyBudget * parseInt(days);
    
    return {
      totalBudget,
      dailyBudget,
      accommodationPerDay: dailyBudget * 0.4,
      foodPerDay: dailyBudget * 0.3,
      activitiesPerDay: dailyBudget * 0.2,
      transportPerDay: dailyBudget * 0.1
    };
  };

  const tripBudget = calculateTripBudget(
    itinerary.itinerary,
    itinerary.budget,
    parseInt(itinerary.days),
    itinerary.travelCompanions
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${itinerary.title} - Travel Itinerary</title>
    <meta name="description" content="${itinerary.destination} - ${itinerary.days} day${itinerary.days !== '1' ? 's' : ''} trip itinerary for ${itinerary.travelCompanions}">
    <meta property="og:title" content="${itinerary.title}">
    <meta property="og:description" content="${itinerary.destination} - ${itinerary.days} day trip itinerary">
    <meta property="og:type" content="article">
    ${itinerary.destinationImage ? `<meta property="og:image" content="${itinerary.destinationImage}">` : ''}
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .title { 
            color: #2c3e50; 
            margin-bottom: 10px; 
            font-size: 2.5em;
        }
        .subtitle { 
            color: #7f8c8d; 
            font-size: 1.2em;
        }
        .details-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0;
        }
        .detail-card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .detail-card .icon { 
            font-size: 2em; 
            margin-bottom: 10px;
        }
        .detail-card .label { 
            font-weight: bold; 
            color: #2c3e50;
        }
        .detail-card .value { 
            color: #7f8c8d;
        }
        .main-content { 
            display: grid; 
            grid-template-columns: 2fr 1fr; 
            gap: 30px; 
            margin-top: 30px;
        }
        .itinerary-section { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .section-title { 
            font-size: 1.8em; 
            margin-bottom: 20px; 
            color: #2c3e50; 
            display: flex; 
            align-items: center;
        }
        .section-title .emoji { 
            margin-right: 10px;
        }
        .day-item { 
            margin-bottom: 30px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 20px;
        }
        .day-header { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 15px; 
            display: flex; 
            align-items: center;
        }
        .day-number { 
            background: #3498db; 
            color: white; 
            border-radius: 50%; 
            width: 30px; 
            height: 30px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-right: 15px; 
            font-size: 0.9em;
        }
        .timeline { 
            margin-left: 45px;
        }
        .time-period { 
            margin-bottom: 20px;
        }
        .time-period h4 { 
            color: #3498db; 
            margin-bottom: 10px; 
            display: flex; 
            align-items: center;
        }
        .time-period h4 .emoji { 
            margin-right: 8px;
        }
        .activity { 
            margin-bottom: 8px; 
            padding-left: 20px;
        }
        .activity-name { 
            font-weight: bold; 
            color: #2c3e50;
        }
        .activity-details { 
            color: #7f8c8d; 
            margin-left: 5px;
        }
        .travel-tip { 
            background: #f8f9fa; 
            border-left: 4px solid #3498db; 
            padding: 15px; 
            margin: 20px 0; 
            border-radius: 5px;
        }
        .travel-tip .tip-title { 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 5px;
        }
        .sidebar { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            height: fit-content;
        }
        .budget-section { 
            margin-bottom: 30px;
        }
        .budget-item { 
            display: flex; 
            justify-content: between; 
            margin-bottom: 10px; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee;
        }
        .budget-label { 
            font-weight: bold; 
            color: #2c3e50;
        }
        .budget-value { 
            color: #27ae60; 
            font-weight: bold;
        }
        .interests { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin: 15px 0;
        }
        .interest-tag { 
            background: #3498db; 
            color: white; 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 0.9em;
        }
        .destination-image { 
            width: 100%; 
            height: 300px; 
            object-fit: cover; 
            border-radius: 10px; 
            margin-bottom: 20px;
        }
        .info-section { 
            margin-bottom: 25px;
        }
        .info-section h3 { 
            color: #2c3e50; 
            margin-bottom: 10px; 
            display: flex; 
            align-items: center;
        }
        .info-section h3 .emoji { 
            margin-right: 8px;
        }
        .info-content { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #3498db;
        }
        .list-item { 
            margin-bottom: 15px; 
            border-left: 3px solid #3498db; 
            padding-left: 15px;
        }
        .list-item h4 { 
            color: #2c3e50; 
            margin-bottom: 5px;
        }
        .list-item p { 
            color: #7f8c8d; 
            margin: 0;
        }
        @media (max-width: 768px) {
            .main-content { 
                grid-template-columns: 1fr;
            }
            .details-grid { 
                grid-template-columns: 1fr;
            }
            body { 
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${itinerary.title}</h1>
        <p class="subtitle">${itinerary.destination} • ${itinerary.days} day${itinerary.days !== '1' ? 's' : ''}</p>
        <small>Saved on ${new Date(itinerary.createdAt).toLocaleDateString()}</small>
    </div>

    <div class="details-grid">
        <div class="detail-card">
            <div class="icon">🌍</div>
            <div class="label">Destination</div>
            <div class="value">${itinerary.destination}</div>
        </div>
        <div class="detail-card">
            <div class="icon">📅</div>
            <div class="label">Duration</div>
            <div class="value">${itinerary.days} day${itinerary.days !== '1' ? 's' : ''}</div>
        </div>
        <div class="detail-card">
            <div class="icon">💰</div>
            <div class="label">Budget</div>
            <div class="value">${itinerary.budget.split(' ')[0]}</div>
        </div>
        <div class="detail-card">
            <div class="icon">👥</div>
            <div class="label">Travel Group</div>
            <div class="value">${itinerary.travelCompanions}</div>
        </div>
    </div>

    <div class="interests">
        ${itinerary.interests.split(',').map(interest => 
            `<span class="interest-tag">${interest.trim()}</span>`
        ).join('')}
    </div>

    <div class="main-content">
        <div class="itinerary-section">
            <h2 class="section-title">
                <span class="emoji">🗺️</span>
                Your Itinerary
            </h2>

            ${itinerary.destinationImage ? `
                <img src="${itinerary.destinationImage}" alt="${itinerary.destination}" class="destination-image">
            ` : ''}

            ${itinerary.itinerary.map((day, index) => `
                <div class="day-item">
                    <div class="day-header">
                        <div class="day-number">${index + 1}</div>
                        <div>
                            <div>${day.day}</div>
                            ${day.location && day.google_map_url ? `
                                <a href="${day.google_map_url}" target="_blank" style="font-size: 0.9em; color: #3498db; text-decoration: none;">
                                    📍 View ${day.location} on Map
                                </a>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="timeline">
                        <div class="time-period">
                            <h4><span class="emoji">🌅</span>Morning</h4>
                            ${day.morning.map(activity => `
                                <div class="activity">
                                    <span class="activity-name">${activity.activity}</span>
                                    ${activity.details ? `<span class="activity-details">— ${activity.details}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>

                        <div class="time-period">
                            <h4><span class="emoji">☀️</span>Afternoon</h4>
                            ${day.afternoon.map(activity => `
                                <div class="activity">
                                    <span class="activity-name">${activity.activity}</span>
                                    ${activity.details ? `<span class="activity-details">— ${activity.details}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>

                        <div class="time-period">
                            <h4><span class="emoji">🌙</span>Evening</h4>
                            ${day.evening.map(activity => `
                                <div class="activity">
                                    <span class="activity-name">${activity.activity}</span>
                                    ${activity.details ? `<span class="activity-details">— ${activity.details}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="travel-tip">
                        <div class="tip-title">💡 Travel Tip</div>
                        <div>${day.travel_tip}</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="sidebar">
            <h2 class="section-title">
                <span class="emoji">📊</span>
                Trip Information
            </h2>

            <div class="budget-section">
                <h3>💰 Budget Breakdown</h3>
                <div class="budget-item">
                    <span class="budget-label">Total Budget:</span>
                    <span class="budget-value">$${tripBudget.totalBudget}</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Daily Budget:</span>
                    <span class="budget-value">$${tripBudget.dailyBudget}/day</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Accommodation:</span>
                    <span class="budget-value">$${tripBudget.accommodationPerDay}/day</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Food:</span>
                    <span class="budget-value">$${tripBudget.foodPerDay}/day</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Activities:</span>
                    <span class="budget-value">$${tripBudget.activitiesPerDay}/day</span>
                </div>
                <div class="budget-item">
                    <span class="budget-label">Transport:</span>
                    <span class="budget-value">$${tripBudget.transportPerDay}/day</span>
                </div>
            </div>

            ${itinerary.destinationOverview ? `
                <div class="info-section">
                    <h3><span class="emoji">🌟</span>Destination Overview</h3>
                    <div class="info-content">${itinerary.destinationOverview}</div>
                </div>
            ` : ''}

            ${itinerary.bestTimeToVisit ? `
                <div class="info-section">
                    <h3><span class="emoji">🗓️</span>Best Time to Visit</h3>
                    <div class="info-content">${itinerary.bestTimeToVisit}</div>
                </div>
            ` : ''}

            ${itinerary.hiddenGems && itinerary.hiddenGems.length > 0 ? `
                <div class="info-section">
                    <h3><span class="emoji">💎</span>Hidden Gems</h3>
                    ${itinerary.hiddenGems.map(gem => `
                        <div class="list-item">
                            <h4>${gem.name}</h4>
                            <p>${gem.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${itinerary.localExperiences && itinerary.localExperiences.length > 0 ? `
                <div class="info-section">
                    <h3><span class="emoji">🎭</span>Local Experiences</h3>
                    ${itinerary.localExperiences.map(experience => `
                        <div class="list-item">
                            <h4>${experience.name}</h4>
                            <p>${experience.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${itinerary.foodAndDining && itinerary.foodAndDining.length > 0 ? `
                <div class="info-section">
                    <h3><span class="emoji">🍽️</span>Food & Dining</h3>
                    ${itinerary.foodAndDining.map(food => `
                        <div class="list-item">
                            <h4>${food.name}</h4>
                            <p>${food.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
}

function generateIndexHTML(itineraries) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saved Travel Itineraries</title>
    <meta name="description" content="Browse all saved travel itineraries and trip plans">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .itineraries-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
            gap: 20px;
        }
        .itinerary-card { 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            overflow: hidden; 
            transition: transform 0.3s ease;
        }
        .itinerary-card:hover { 
            transform: translateY(-5px);
        }
        .card-image { 
            width: 100%; 
            height: 200px; 
            object-fit: cover;
        }
        .card-content { 
            padding: 20px;
        }
        .card-title { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 10px;
        }
        .card-details { 
            color: #7f8c8d; 
            margin-bottom: 15px;
        }
        .card-link { 
            display: inline-block; 
            background: #3498db; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 5px; 
            text-decoration: none; 
            transition: background 0.3s ease;
        }
        .card-link:hover { 
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📍 Saved Travel Itineraries</h1>
        <p>Browse all your saved travel itineraries and trip plans</p>
    </div>

    <div class="itineraries-grid">
        ${itineraries.map(itinerary => `
            <div class="itinerary-card">
                ${itinerary.destinationImage ? `
                    <img src="${itinerary.destinationImage}" alt="${itinerary.destination}" class="card-image">
                ` : ''}
                <div class="card-content">
                    <h3 class="card-title">${itinerary.title}</h3>
                    <p class="card-details">
                        ${itinerary.destination} • ${itinerary.days} day${itinerary.days !== '1' ? 's' : ''}<br>
                        ${itinerary.budget} • ${itinerary.travelCompanions}
                    </p>
                    <a href="./saved-itinerary/${itinerary.id}/" class="card-link">View Itinerary →</a>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

function generatePackingListHTMLContent(packingList) {
  const getTotalItems = (packing_list) => {
    return Object.values(packing_list).reduce((total, category) => total + category.length, 0);
  };

  const getEssentialItems = (packing_list) => {
    return Object.values(packing_list).reduce((total, category) => 
      total + category.filter((item) => item.priority === 'essential').length, 0
    );
  };

  const getSeasonEmoji = (season) => {
    switch (season.toLowerCase()) {
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'autumn': case 'fall': return '🍂';
      case 'winter': return '❄️';
      default: return '🌤️';
    }
  };

  const getTripTypeEmoji = (tripType) => {
    switch (tripType.toLowerCase()) {
      case 'leisure': return '🏖️';
      case 'business': return '💼';
      case 'adventure': return '🏔️';
      case 'cultural': return '🏛️';
      case 'romantic': return '💕';
      case 'family': return '👨‍👩‍👧‍👦';
      default: return '✈️';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'essential': return '#e74c3c';
      case 'recommended': case 'high': return '#f39c12';
      case 'optional': case 'medium': case 'low': return '#27ae60';
      default: return '#3498db';
    }
  };

  const getPriorityBadge = (priority) => {
    const color = getPriorityColor(priority);
    const displayText = priority.charAt(0).toUpperCase() + priority.slice(1);
    return `<span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold;">${displayText}</span>`;
  };

  const totalItems = getTotalItems(packingList.packing_list);
  const essentialItems = getEssentialItems(packingList.packing_list);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${packingList.title} - Packing List</title>
    <meta name="description" content="${packingList.destination} - ${packingList.days} day${packingList.days !== '1' ? 's' : ''} ${packingList.trip_type} trip packing list for ${packingList.season} season">
    <meta property="og:title" content="${packingList.title}">
    <meta property="og:description" content="${packingList.destination} - ${packingList.days} day ${packingList.trip_type} trip packing list">
    <meta property="og:type" content="article">
    ${packingList.destination_image ? `<meta property="og:image" content="${packingList.destination_image}">` : ''}
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #e8f5e8 0%, #c3e8f7 100%);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .title { 
            color: #2c3e50; 
            margin-bottom: 10px; 
            font-size: 2.5em;
        }
        .subtitle { 
            color: #7f8c8d; 
            font-size: 1.2em;
        }
        .details-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 30px 0;
        }
        .detail-card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            text-align: center; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .detail-card .icon { 
            font-size: 2em; 
            margin-bottom: 10px;
        }
        .detail-card .label { 
            font-weight: bold; 
            color: #2c3e50;
        }
        .detail-card .value { 
            color: #7f8c8d;
        }
        .main-content { 
            display: grid; 
            grid-template-columns: 2fr 1fr; 
            gap: 30px; 
            margin-top: 30px;
        }
        .packing-section { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .section-title { 
            font-size: 1.8em; 
            margin-bottom: 20px; 
            color: #2c3e50; 
            display: flex; 
            align-items: center;
        }
        .section-title .emoji { 
            margin-right: 10px;
        }
        .category-section { 
            margin-bottom: 30px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 20px;
        }
        .category-header { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 15px; 
            display: flex; 
            align-items: center;
            text-transform: capitalize;
        }
        .category-icon { 
            margin-right: 10px; 
            font-size: 1.2em;
        }
        .items-grid { 
            display: grid; 
            gap: 10px;
        }
        .packing-item { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            background: #f8f9fa; 
            padding: 12px 15px; 
            border-radius: 8px; 
            border-left: 4px solid #3498db;
        }
        .item-info { 
            flex: 1;
        }
        .item-name { 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 3px;
        }
        .item-description { 
            color: #7f8c8d; 
            font-size: 0.9em;
        }
        .item-quantity { 
            color: #3498db; 
            font-weight: bold; 
            margin-right: 10px; 
            min-width: 60px; 
            text-align: right;
        }
        .sidebar { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            height: fit-content;
        }
        .stats-section { 
            margin-bottom: 30px;
        }
        .stat-item { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee;
        }
        .stat-label { 
            font-weight: bold; 
            color: #2c3e50;
        }
        .stat-value { 
            color: #27ae60; 
            font-weight: bold;
        }
        .activities { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
            margin: 15px 0;
        }
        .activity-tag { 
            background: #3498db; 
            color: white; 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 0.9em;
        }
        .destination-image { 
            width: 100%; 
            height: 300px; 
            object-fit: cover; 
            border-radius: 10px; 
            margin-bottom: 20px;
        }
        .info-section { 
            margin-bottom: 25px;
        }
        .info-section h3 { 
            color: #2c3e50; 
            margin-bottom: 10px; 
            display: flex; 
            align-items: center;
        }
        .info-section h3 .emoji { 
            margin-right: 8px;
        }
        .info-content { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #3498db;
        }
        .tips-list { 
            list-style: none; 
            padding: 0;
        }
        .tips-list li { 
            background: #e8f5e8; 
            margin-bottom: 8px; 
            padding: 10px 15px; 
            border-radius: 5px; 
            border-left: 3px solid #27ae60;
        }
        .tips-list li:before { 
            content: "💡 "; 
            margin-right: 8px;
        }
        .faq-item { 
            margin-bottom: 15px; 
            border-left: 3px solid #3498db; 
            padding-left: 15px;
        }
        .faq-question { 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 5px;
        }
        .faq-answer { 
            color: #7f8c8d; 
            margin: 0;
        }
        @media (max-width: 768px) {
            .main-content { 
                grid-template-columns: 1fr;
            }
            .details-grid { 
                grid-template-columns: 1fr;
            }
            body { 
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${packingList.title}</h1>
        <p class="subtitle">${packingList.destination} • ${packingList.days} day${packingList.days !== '1' ? 's' : ''} • ${getSeasonEmoji(packingList.season)} ${packingList.season.charAt(0).toUpperCase() + packingList.season.slice(1)} • ${getTripTypeEmoji(packingList.trip_type)} ${packingList.trip_type.charAt(0).toUpperCase() + packingList.trip_type.slice(1)}</p>
        <small>Saved on ${new Date(packingList.createdAt).toLocaleDateString()}</small>
    </div>

    <div class="details-grid">
        <div class="detail-card">
            <div class="icon">🌍</div>
            <div class="label">Destination</div>
            <div class="value">${packingList.destination}</div>
        </div>
        <div class="detail-card">
            <div class="icon">📅</div>
            <div class="label">Duration</div>
            <div class="value">${packingList.days} day${packingList.days !== '1' ? 's' : ''}</div>
        </div>
        <div class="detail-card">
            <div class="icon">${getSeasonEmoji(packingList.season)}</div>
            <div class="label">Season</div>
            <div class="value">${packingList.season.charAt(0).toUpperCase() + packingList.season.slice(1)}</div>
        </div>
        <div class="detail-card">
            <div class="icon">${getTripTypeEmoji(packingList.trip_type)}</div>
            <div class="label">Trip Type</div>
            <div class="value">${packingList.trip_type.charAt(0).toUpperCase() + packingList.trip_type.slice(1)}</div>
        </div>
    </div>

    <div class="activities">
        ${packingList.activities.split(',').map(activity => 
            `<span class="activity-tag">${activity.trim()}</span>`
        ).join('')}
    </div>

    <div class="main-content">
        <div class="packing-section">
            <h2 class="section-title">
                <span class="emoji">🎒</span>
                Your Packing List
            </h2>

            ${packingList.destination_image ? `
                <img src="${packingList.destination_image}" alt="${packingList.destination}" class="destination-image">
            ` : ''}

            ${Object.entries(packingList.packing_list).map(([category, items]) => {
                const categoryIcons = {
                    clothing: '👕',
                    toiletries: '🧴',
                    electronics: '🔌',
                    documents: '📄',
                    health_safety: '🏥',
                    activity_specific: '⚡',
                    miscellaneous: '📦'
                };
                
                return `
                <div class="category-section">
                    <div class="category-header">
                        <span class="category-icon">${categoryIcons[category] || '📦'}</span>
                        ${category.replace('_', ' ')}
                        <span style="margin-left: auto; background: #3498db; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">${items.length} items</span>
                    </div>
                    
                    <div class="items-grid">
                        ${items.map(item => `
                            <div class="packing-item">
                                <div class="item-info">
                                    <div class="item-name">${item.item}</div>
                                    ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                                </div>
                                <div class="item-quantity">${item.quantity}</div>
                                ${getPriorityBadge(item.priority)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                `;
            }).join('')}
        </div>

        <div class="sidebar">
            <h2 class="section-title">
                <span class="emoji">📊</span>
                Trip Information
            </h2>

            <div class="stats-section">
                <h3>🎯 Packing Stats</h3>
                <div class="stat-item">
                    <span class="stat-label">Total Items:</span>
                    <span class="stat-value">${totalItems}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Essential Items:</span>
                    <span class="stat-value">${essentialItems}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Categories:</span>
                    <span class="stat-value">${Object.keys(packingList.packing_list).length}</span>
                </div>
            </div>

            ${packingList.packing_tips && packingList.packing_tips.length > 0 ? `
                <div class="info-section">
                    <h3><span class="emoji">💡</span>Packing Tips</h3>
                    <ul class="tips-list">
                        ${packingList.packing_tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${packingList.destination_details ? `
                ${packingList.destination_details.overview ? `
                    <div class="info-section">
                        <h3><span class="emoji">🌟</span>Destination Overview</h3>
                        <div class="info-content">${packingList.destination_details.overview}</div>
                    </div>
                ` : ''}

                ${packingList.destination_details.best_time_to_visit ? `
                    <div class="info-section">
                        <h3><span class="emoji">🗓️</span>Best Time to Visit</h3>
                        <div class="info-content">${packingList.destination_details.best_time_to_visit}</div>
                    </div>
                ` : ''}

                ${packingList.destination_details.weather_summary ? `
                    <div class="info-section">
                        <h3><span class="emoji">🌤️</span>Weather</h3>
                        <div class="info-content">${packingList.destination_details.weather_summary}</div>
                    </div>
                ` : ''}

                ${packingList.destination_details.cultural_tips ? `
                    <div class="info-section">
                        <h3><span class="emoji">🎭</span>Cultural Tips</h3>
                        <div class="info-content">${packingList.destination_details.cultural_tips}</div>
                    </div>
                ` : ''}

                ${packingList.destination_details.currency ? `
                    <div class="info-section">
                        <h3><span class="emoji">💰</span>Currency</h3>
                        <div class="info-content">${packingList.destination_details.currency}</div>
                    </div>
                ` : ''}

                ${packingList.destination_details.power_plugs ? `
                    <div class="info-section">
                        <h3><span class="emoji">🔌</span>Power Plugs</h3>
                        <div class="info-content">${packingList.destination_details.power_plugs}</div>
                    </div>
                ` : ''}
            ` : ''}

            ${packingList.destination_notes ? `
                <div class="info-section">
                    <h3><span class="emoji">📝</span>Notes</h3>
                    <div class="info-content">${packingList.destination_notes}</div>
                </div>
            ` : ''}

            ${packingList.faqs && packingList.faqs.length > 0 ? `
                <div class="info-section">
                    <h3><span class="emoji">❓</span>FAQs</h3>
                    ${packingList.faqs.map(faq => `
                        <div class="faq-item">
                            <div class="faq-question">${faq.question}</div>
                            <p class="faq-answer">${faq.answer}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
}

function generatePackingListIndexHTML(packingLists) {
  const getSeasonEmoji = (season) => {
    switch (season.toLowerCase()) {
      case 'spring': return '🌸';
      case 'summer': return '☀️';
      case 'autumn': case 'fall': return '🍂';
      case 'winter': return '❄️';
      default: return '🌤️';
    }
  };

  const getTripTypeEmoji = (tripType) => {
    switch (tripType.toLowerCase()) {
      case 'leisure': return '🏖️';
      case 'business': return '💼';
      case 'adventure': return '🏔️';
      case 'cultural': return '🏛️';
      case 'romantic': return '💕';
      case 'family': return '👨‍👩‍👧‍👦';
      default: return '✈️';
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saved Packing Lists Collection</title>
    <meta name="description" content="Browse all saved travel packing lists and checklists">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background: linear-gradient(135deg, #e8f5e8 0%, #c3e8f7 100%);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .packing-lists-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
            gap: 20px;
        }
        .packing-list-card { 
            background: white; 
            border-radius: 15px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            overflow: hidden; 
            transition: transform 0.3s ease;
        }
        .packing-list-card:hover { 
            transform: translateY(-5px);
        }
        .card-image { 
            width: 100%; 
            height: 200px; 
            object-fit: cover;
        }
        .card-content { 
            padding: 20px;
        }
        .card-title { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #2c3e50; 
            margin-bottom: 10px;
        }
        .card-details { 
            color: #7f8c8d; 
            margin-bottom: 15px;
        }
        .card-link { 
            display: inline-block; 
            background: #27ae60; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 5px; 
            text-decoration: none; 
            transition: background 0.3s ease;
        }
        .card-link:hover { 
            background: #219a52;
        }
        .card-stats { 
            display: flex; 
            gap: 15px; 
            margin-bottom: 15px;
        }
        .stat { 
            background: #f8f9fa; 
            padding: 8px 12px; 
            border-radius: 5px; 
            text-align: center;
        }
        .stat-number { 
            font-weight: bold; 
            color: #2c3e50;
        }
        .stat-label { 
            font-size: 0.8em; 
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎒 Saved Packing Lists Collection</h1>
        <p>Browse all your saved travel packing lists and checklists</p>
    </div>

    <div class="packing-lists-grid">
        ${packingLists.map(packingList => {
            const totalItems = Object.values(packingList.packing_list).reduce((total, category) => total + category.length, 0);
            const essentialItems = Object.values(packingList.packing_list).reduce((total, category) => 
                total + category.filter((item) => item.priority === 'essential').length, 0
            );
            
            return `
            <div class="packing-list-card">
                ${packingList.destination_image ? `
                    <img src="${packingList.destination_image}" alt="${packingList.destination}" class="card-image">
                ` : ''}
                <div class="card-content">
                    <h3 class="card-title">${packingList.title}</h3>
                    <p class="card-details">
                        ${getSeasonEmoji(packingList.season)} ${packingList.season.charAt(0).toUpperCase() + packingList.season.slice(1)} • 
                        ${getTripTypeEmoji(packingList.trip_type)} ${packingList.trip_type.charAt(0).toUpperCase() + packingList.trip_type.slice(1)}<br>
                        📅 ${packingList.days} day${packingList.days !== '1' ? 's' : ''} • 
                        🌍 ${packingList.destination}
                    </p>
                    <div class="card-stats">
                        <div class="stat">
                            <div class="stat-number">${totalItems}</div>
                            <div class="stat-label">Items</div>
                        </div>
                        <div class="stat">
                            <div class="stat-number">${essentialItems}</div>
                            <div class="stat-label">Essential</div>
                        </div>
                    </div>
                    <a href="./saved-packing-list/${packingList.id}/" class="card-link">View Packing List →</a>
                </div>
            </div>
            `;
        }).join('')}
    </div>
</body>
</html>`;
}

// Run the function
generateStaticPages().catch(console.error);
