interface TripData {
  destination: string;
  days: string;
  budget: string;
  travelCompanions: string;
  interests: string;
}

export function generateSEOTitle(tripData: TripData): string {
  const { destination, days, budget, travelCompanions, interests } = tripData;
  
  // Extract budget level for title
  const getBudgetLevel = (budget: string): string => {
    if (budget.includes('Budget-friendly')) return 'Budget';
    if (budget.includes('Mid-range')) return 'Mid-Range';
    if (budget.includes('Luxury') && !budget.includes('Ultra')) return 'Luxury';
    if (budget.includes('Ultra-luxury')) return 'Ultra-Luxury';
    return '';
  };

  // Extract companion type for title
  const getCompanionType = (companions: string): string => {
    if (companions.includes('solo')) return 'Solo';
    if (companions.includes('couple')) return 'Couple';
    if (companions.includes('family with young')) return 'Family';
    if (companions.includes('family with teen')) return 'Family';
    if (companions.includes('group of friends')) return 'Group';
    if (companions.includes('business')) return 'Business';
    return '';
  };

  // Extract main interest for title
  const getMainInterest = (interests: string): string => {
    const interestList = interests.toLowerCase();
    
    // Culture & History - use "Museums" as title
    if (interestList.includes('museums')) return 'Museums';
    if (interestList.includes('historical sites')) return 'Historical Sites';
    if (interestList.includes('architecture')) return 'Architecture';
    if (interestList.includes('local traditions')) return 'Local Traditions';
    if (interestList.includes('culture') || interestList.includes('historical')) return 'Museums';
    
    // Food & Drink - use "Local Cuisine" as title
    if (interestList.includes('local cuisine')) return 'Local Cuisine';
    if (interestList.includes('street food')) return 'Street Food';
    if (interestList.includes('fine dining')) return 'Fine Dining';
    if (interestList.includes('food markets')) return 'Food Markets';
    if (interestList.includes('cooking classes')) return 'Cooking Classes';
    if (interestList.includes('food') || interestList.includes('dining') || interestList.includes('cuisine')) return 'Local Cuisine';
    
    // Adventure & Sports - use "Hiking" as title
    if (interestList.includes('hiking')) return 'Hiking';
    if (interestList.includes('water sports')) return 'Water Sports';
    if (interestList.includes('extreme sports')) return 'Extreme Sports';
    if (interestList.includes('cycling')) return 'Cycling';
    if (interestList.includes('rock climbing')) return 'Rock Climbing';
    if (interestList.includes('adventure') || interestList.includes('sports')) return 'Hiking';
    
    // Nature & Wildlife - use "National Parks" as title
    if (interestList.includes('national parks')) return 'National Parks';
    if (interestList.includes('wildlife watching')) return 'Wildlife Watching';
    if (interestList.includes('gardens')) return 'Gardens';
    if (interestList.includes('beaches')) return 'Beaches';
    if (interestList.includes('scenic views')) return 'Scenic Views';
    if (interestList.includes('nature') || interestList.includes('wildlife') || interestList.includes('beach')) return 'National Parks';
    
    // Entertainment & Nightlife - use "Nightlife" as title
    if (interestList.includes('nightlife')) return 'Nightlife';
    if (interestList.includes('live music')) return 'Live Music';
    if (interestList.includes('theater')) return 'Theater';
    if (interestList.includes('festivals')) return 'Festivals';
    if (interestList.includes('casinos')) return 'Casinos';
    if (interestList.includes('entertainment')) return 'Nightlife';
    
    // Shopping & Markets - use "Local Markets" as title
    if (interestList.includes('local markets')) return 'Local Markets';
    if (interestList.includes('shopping centers')) return 'Shopping Centers';
    if (interestList.includes('antiques')) return 'Antiques';
    if (interestList.includes('souvenirs')) return 'Souvenirs';
    if (interestList.includes('fashion')) return 'Fashion';
    if (interestList.includes('shopping')) return 'Local Markets';
    
    // Wellness & Relaxation - use "Spas" as title
    if (interestList.includes('spas')) return 'Spas';
    if (interestList.includes('yoga')) return 'Yoga';
    if (interestList.includes('meditation')) return 'Meditation';
    if (interestList.includes('hot springs')) return 'Hot Springs';
    if (interestList.includes('wellness retreats')) return 'Wellness Retreats';
    if (interestList.includes('wellness') || interestList.includes('spa') || interestList.includes('relaxation')) return 'Spas';
    
    // Photography & Art - use "Photography Spots" as title
    if (interestList.includes('photography spots')) return 'Photography Spots';
    if (interestList.includes('art galleries')) return 'Art Galleries';
    if (interestList.includes('street art')) return 'Street Art';
    if (interestList.includes('instagrammable places')) return 'Instagrammable Places';
    if (interestList.includes('photography') || interestList.includes('art')) return 'Photography Spots';
    
    return '';
  };

  const budgetLevel = getBudgetLevel(budget);
  const companionType = getCompanionType(travelCompanions);
  const mainInterest = getMainInterest(interests);

  // Build title components
  const titleParts: string[] = [];
  
  // Always include destination and days
  titleParts.push(`${days}-Day ${destination}`);
  
  // Add descriptive elements based on available space
  const baseTitle = titleParts.join(' ');
  const remainingChars = 60 - baseTitle.length - ' Itinerary'.length;
  
  // Add qualifiers based on remaining character space
  const qualifiers: string[] = [];
  
  if (companionType && remainingChars > companionType.length + 1) {
    qualifiers.push(companionType);
  }
  
  if (mainInterest && remainingChars > (qualifiers.join(' ').length + mainInterest.length + 2)) {
    qualifiers.push(mainInterest);
  }
  
  if (budgetLevel && remainingChars > (qualifiers.join(' ').length + budgetLevel.length + 2)) {
    qualifiers.push(budgetLevel);
  }
  
  // Construct final title
  let finalTitle = `${days}-Day ${destination}`;
  
  if (qualifiers.length > 0) {
    finalTitle += ` ${qualifiers.join(' ')}`;
  }
  
  finalTitle += ' Itinerary';
  
  // Ensure title is within 50-60 character range
  if (finalTitle.length > 60) {
    // Fallback to simpler title if too long
    finalTitle = `${days}-Day ${destination} Travel Itinerary`;
    
    // If still too long, further simplify
    if (finalTitle.length > 60) {
      finalTitle = `${days}-Day ${destination} Guide`;
    }
  }
  
  // Ensure minimum length of 50 characters by adding descriptive words
  if (finalTitle.length < 50) {
    const additionalWords = ['Perfect', 'Complete', 'Ultimate', 'Detailed', 'Comprehensive'];
    for (const word of additionalWords) {
      const testTitle = `${word} ${finalTitle}`;
      if (testTitle.length <= 60 && testTitle.length >= 50) {
        finalTitle = testTitle;
        break;
      }
    }
  }
  
  return finalTitle;
}

export function generateSEODescription(tripData: TripData): string {
  const { destination, days, budget, travelCompanions, interests } = tripData;
  
  const getBudgetLevel = (budget: string): string => {
    if (budget.includes('Budget-friendly')) return 'budget-friendly';
    if (budget.includes('Mid-range')) return 'mid-range';
    if (budget.includes('Luxury') && !budget.includes('Ultra')) return 'luxury';
    if (budget.includes('Ultra-luxury')) return 'ultra-luxury';
    return '';
  };

  const budgetLevel = getBudgetLevel(budget);
  const mainInterests = interests.split(',').slice(0, 3).map(i => i.trim()).join(', ');
  
  let description = `Discover the perfect ${days}-day ${destination} itinerary`;
  
  if (travelCompanions && travelCompanions !== 'solo traveler') {
    description += ` for ${travelCompanions}`;
  }
  
  if (budgetLevel) {
    description += ` with ${budgetLevel} recommendations`;
  }
  
  if (mainInterests) {
    description += `. Includes ${mainInterests} and more`;
  }
  
  description += '. AI-powered travel planning with personalized suggestions.';
  
  return description;
}
