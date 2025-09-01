export interface BudgetBreakdown {
  accommodation: {
    cost: number;
    description: string;
  };
  meals: {
    cost: number;
    description: string;
  };
  activities: {
    cost: number;
    description: string;
  };
  transportation: {
    cost: number;
    description: string;
  };
  miscellaneous: {
    cost: number;
    description: string;
  };
  totalPerDay: number;
  totalTrip: number;
  budgetRange: string;
}

export interface Activity {
  activity: string;
  details: string;
}

export interface DayItinerary {
  day: string;
  location: string;
  google_map_url: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
  travel_tip: string;
}

// Extract numeric values from budget string
function extractBudgetRange(budgetString: string): { min: number; max: number } {
  const matches = budgetString.match(/\$(\d+)-(\d+)/);
  if (matches) {
    return { min: parseInt(matches[1]), max: parseInt(matches[2]) };
  }
  
  // Handle ultra-luxury case ($500+/day)
  const ultraLuxuryMatch = budgetString.match(/\$(\d+)\+/);
  if (ultraLuxuryMatch) {
    const min = parseInt(ultraLuxuryMatch[1]);
    return { min, max: min * 2 }; // Estimate max as double
  }
  
  // Default fallback
  return { min: 100, max: 200 };
}

// Calculate activity costs based on content analysis
function calculateActivityCosts(itinerary: DayItinerary[], budgetRange: { min: number; max: number }): number {
  let totalActivityCost = 0;
  const dailyActivityBudget = (budgetRange.min + budgetRange.max) / 2 * 0.3; // 30% of daily budget for activities
  
  itinerary.forEach(day => {
    const allActivities = [...day.morning, ...day.afternoon, ...day.evening];
    let dailyCost = 0;
    
    allActivities.forEach(activity => {
      const activityText = `${activity.activity} ${activity.details}`.toLowerCase();
      
      // High-cost activities
      if (activityText.includes('museum') || activityText.includes('attraction') || 
          activityText.includes('tour') || activityText.includes('show') ||
          activityText.includes('cruise') || activityText.includes('safari')) {
        dailyCost += dailyActivityBudget * 0.4; // 40% of activity budget
      }
      // Medium-cost activities
      else if (activityText.includes('market') || activityText.includes('garden') ||
               activityText.includes('park') || activityText.includes('temple') ||
               activityText.includes('church') || activityText.includes('shopping')) {
        dailyCost += dailyActivityBudget * 0.2; // 20% of activity budget
      }
      // Low-cost or free activities
      else if (activityText.includes('walk') || activityText.includes('explore') ||
               activityText.includes('stroll') || activityText.includes('view') ||
               activityText.includes('beach') || activityText.includes('street')) {
        dailyCost += dailyActivityBudget * 0.1; // 10% of activity budget
      }
      // Default medium cost
      else {
        dailyCost += dailyActivityBudget * 0.25; // 25% of activity budget
      }
    });
    
    totalActivityCost += Math.min(dailyCost, dailyActivityBudget); // Cap at daily budget
  });
  
  return totalActivityCost;
}

// Estimate meal costs based on budget tier and itinerary content
function calculateMealCosts(itinerary: DayItinerary[], budgetRange: { min: number; max: number }, days: number): number {
  const avgDailyBudget = (budgetRange.min + budgetRange.max) / 2;
  let mealBudgetPercentage = 0.25; // Default 25% of budget for meals
  
  // Adjust based on budget tier
  if (avgDailyBudget <= 100) {
    mealBudgetPercentage = 0.30; // Budget travelers spend more % on food
  } else if (avgDailyBudget >= 300) {
    mealBudgetPercentage = 0.35; // Luxury travelers spend more on dining
  }
  
  const dailyMealBudget = avgDailyBudget * mealBudgetPercentage;
  
  // Check for dining-related activities in itinerary
  let diningActivityBonus = 0;
  itinerary.forEach(day => {
    const allActivities = [...day.morning, ...day.afternoon, ...day.evening];
    allActivities.forEach(activity => {
      const activityText = `${activity.activity} ${activity.details}`.toLowerCase();
      if (activityText.includes('dinner') || activityText.includes('lunch') || 
          activityText.includes('restaurant') || activityText.includes('cuisine') ||
          activityText.includes('food') || activityText.includes('dining')) {
        diningActivityBonus += dailyMealBudget * 0.2; // 20% bonus for special dining
      }
    });
  });
  
  return (dailyMealBudget * days) + diningActivityBonus;
}

// Calculate transportation costs based on activities and budget
function calculateTransportationCosts(itinerary: DayItinerary[], budgetRange: { min: number; max: number }, days: number): number {
  const avgDailyBudget = (budgetRange.min + budgetRange.max) / 2;
  let transportPercentage = 0.15; // Default 15% of budget for local transport
  
  // Adjust based on budget tier
  if (avgDailyBudget <= 100) {
    transportPercentage = 0.10; // Budget travelers use more public transport
  } else if (avgDailyBudget >= 300) {
    transportPercentage = 0.20; // Luxury travelers use more private transport
  }
  
  const dailyTransportBudget = avgDailyBudget * transportPercentage;
  
  // Check for transport-intensive activities
  let transportBonus = 0;
  itinerary.forEach(day => {
    const allActivities = [...day.morning, ...day.afternoon, ...day.evening];
    allActivities.forEach(activity => {
      const activityText = `${activity.activity} ${activity.details}`.toLowerCase();
      if (activityText.includes('tour') || activityText.includes('trip') || 
          activityText.includes('excursion') || activityText.includes('transfer') ||
          activityText.includes('taxi') || activityText.includes('uber')) {
        transportBonus += dailyTransportBudget * 0.3; // 30% bonus for tours/transfers
      }
    });
  });
  
  return (dailyTransportBudget * days) + transportBonus;
}

export function calculateTripBudget(
  itinerary: DayItinerary[], 
  budgetString: string, 
  days: number,
  travelCompanions: string
): BudgetBreakdown {
  const budgetRange = extractBudgetRange(budgetString);
  const avgDailyBudget = (budgetRange.min + budgetRange.max) / 2;
  
  // Adjust for group size
  let groupMultiplier = 1;
  if (travelCompanions.includes('couple')) {
    groupMultiplier = 1.8; // Couples share some costs
  } else if (travelCompanions.includes('family')) {
    groupMultiplier = 2.5; // Families have higher costs but some sharing
  } else if (travelCompanions.includes('group')) {
    groupMultiplier = 3.0; // Groups split many costs
  }
  
  // Calculate individual cost components
  const accommodationCost = avgDailyBudget * days * 0.35 * groupMultiplier; // 35% for accommodation
  const mealsCost = calculateMealCosts(itinerary, budgetRange, days) * groupMultiplier;
  const activitiesCost = calculateActivityCosts(itinerary, budgetRange) * groupMultiplier;
  const transportationCost = calculateTransportationCosts(itinerary, budgetRange, days) * groupMultiplier;
  const miscellaneousCost = avgDailyBudget * days * 0.1 * groupMultiplier; // 10% for misc expenses
  
  const totalTrip = accommodationCost + mealsCost + activitiesCost + transportationCost + miscellaneousCost;
  const totalPerDay = totalTrip / days;
  
  // Generate descriptions based on budget tier
  let accommodationDesc = "";
  let mealsDesc = "";
  let activitiesDesc = "";
  
  if (avgDailyBudget <= 100) {
    accommodationDesc = "Hostels, budget hotels, or shared accommodations";
    mealsDesc = "Street food, local eateries, some grocery shopping";
    activitiesDesc = "Free attractions, budget tours, walking tours";
  } else if (avgDailyBudget <= 250) {
    accommodationDesc = "3-star hotels, mid-range accommodations";
    mealsDesc = "Mix of local restaurants and casual dining";
    activitiesDesc = "Popular attractions, guided tours, cultural experiences";
  } else if (avgDailyBudget <= 500) {
    accommodationDesc = "4-star hotels, boutique accommodations";
    mealsDesc = "Fine dining experiences, upscale restaurants";
    activitiesDesc = "Premium attractions, private tours, exclusive experiences";
  } else {
    accommodationDesc = "5-star luxury hotels, premium resorts";
    mealsDesc = "Michelin-starred restaurants, exclusive dining";
    activitiesDesc = "VIP experiences, private guides, luxury activities";
  }
  
  return {
    accommodation: {
      cost: Math.round(accommodationCost),
      description: accommodationDesc
    },
    meals: {
      cost: Math.round(mealsCost),
      description: mealsDesc
    },
    activities: {
      cost: Math.round(activitiesCost),
      description: activitiesDesc
    },
    transportation: {
      cost: Math.round(transportationCost),
      description: "Local transport, transfers, and tours"
    },
    miscellaneous: {
      cost: Math.round(miscellaneousCost),
      description: "Shopping, tips, unexpected expenses"
    },
    totalPerDay: Math.round(totalPerDay),
    totalTrip: Math.round(totalTrip),
    budgetRange: budgetString
  };
}
