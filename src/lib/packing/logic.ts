// Heuristic packing logic to improve accuracy and provide a robust fallback

export type Priority = 'essential' | 'recommended' | 'optional';

export interface PackingItem {
  item: string;
  quantity: string;
  description: string;
  priority: Priority;
}

export interface PackingList {
  clothing: PackingItem[];
  toiletries: PackingItem[];
  electronics: PackingItem[];
  documents: PackingItem[];
  health_safety: PackingItem[];
  activity_specific: PackingItem[];
  miscellaneous: PackingItem[];
}

export interface DestinationDetails {
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

export interface PackingResponse {
  packing_list: PackingList;
  packing_tips: string[];
  destination_notes: string;
  destination_details?: DestinationDetails;
}

export interface GeneratorInput {
  destination: string;
  days: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  trip_type: string;
  activities: string; // comma-separated labels
}

// Utility helpers
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const ceil = Math.ceil;

function addOrPromote(list: PackingItem[], candidate: PackingItem) {
  const idx = list.findIndex(
    (i) => i.item.trim().toLowerCase() === candidate.item.trim().toLowerCase()
  );
  if (idx === -1) {
    list.push(candidate);
    return;
  }
  // Promote priority if candidate is higher and prefer non-empty description
  const order: Priority[] = ['optional', 'recommended', 'essential'];
  const existing = list[idx];
  if (order.indexOf(candidate.priority) > order.indexOf(existing.priority)) {
    list[idx] = { ...existing, ...candidate };
  } else {
    // Merge quantity if existing is vague and candidate is more specific
    if (existing.quantity.length < candidate.quantity.length) {
      list[idx] = { ...existing, quantity: candidate.quantity };
    }
    if (!existing.description && candidate.description) {
      list[idx] = { ...list[idx], description: candidate.description };
    }
  }
}

function qty(n: number, unit?: string) {
  const s = `${n}`;
  return unit ? `${s} ${unit}` : s;
}

function seasonLayering(season: GeneratorInput['season']) {
  switch (season) {
    case 'winter':
      return { base: 2, mid: 2, outer: 1 };
    case 'autumn':
      return { base: 1, mid: 1, outer: 1 };
    case 'spring':
      return { base: 1, mid: 1, outer: 0 };
    case 'summer':
    default:
      return { base: 1, mid: 0, outer: 0 };
  }
}

function computeClothingQuantities(days: number, season: GeneratorInput['season']) {
  const u = clamp(days + 2, 3, 20); // underwear
  const s = clamp(days + 2, 3, 20); // socks
  const tshirts = clamp(ceil(days * (season === 'summer' ? 0.8 : season === 'spring' || season === 'autumn' ? 0.6 : 0.5)) + 1, 2, 14);
  const longsleeve = season === 'winter' ? clamp(ceil(days * 0.5), 1, 10) : clamp(ceil(days * 0.3), 0, 8);
  const pants = clamp(ceil(days / (season === 'winter' ? 2 : 3)), 1, 6);
  const shorts = season === 'summer' ? clamp(ceil(days / 3), 1, 5) : 0;
  const layers = seasonLayering(season);

  return { u, s, tshirts, longsleeve, pants, shorts, layers };
}

function commonBasics(input: GeneratorInput): PackingList {
  const { days, season, trip_type } = input;
  const { u, s, tshirts, longsleeve, pants, shorts, layers } = computeClothingQuantities(days, season);

  const clothing: PackingItem[] = [];
  addOrPromote(clothing, { item: 'Underwear', quantity: qty(u), description: 'Fresh pair per day plus spares', priority: 'essential' });
  addOrPromote(clothing, { item: 'Socks', quantity: qty(s), description: 'Daily pairs; add moisture-wicking for long walks', priority: 'essential' });
  addOrPromote(clothing, { item: 'T-shirts', quantity: qty(tshirts, 'pieces'), description: 'Breathable tops for layering and casual wear', priority: 'essential' });
  if (longsleeve > 0) addOrPromote(clothing, { item: 'Long-sleeve shirts', quantity: qty(longsleeve, 'pieces'), description: 'Layering for cooler mornings/evenings', priority: season === 'winter' ? 'essential' : 'recommended' });
  addOrPromote(clothing, { item: 'Pants', quantity: qty(pants, 'pairs'), description: 'Versatile bottoms for day and evening', priority: 'essential' });
  if (shorts > 0) addOrPromote(clothing, { item: 'Shorts', quantity: qty(shorts, 'pairs'), description: 'For warm days and casual outings', priority: 'recommended' });
  if (layers.mid) addOrPromote(clothing, { item: 'Sweater/Fleece', quantity: qty(layers.mid, 'piece'), description: 'Mid-layer for warmth', priority: season === 'winter' ? 'essential' : 'recommended' });
  if (layers.outer) addOrPromote(clothing, { item: 'Jacket/Coat', quantity: qty(layers.outer, 'piece'), description: season === 'winter' ? 'Insulated outer layer for cold weather' : 'Light jacket or shell for wind/rain', priority: season === 'winter' ? 'essential' : 'recommended' });
  addOrPromote(clothing, { item: 'Comfortable walking shoes', quantity: '1 pair', description: 'Broken-in shoes for long days on your feet', priority: 'essential' });
  if (season !== 'winter') addOrPromote(clothing, { item: 'Hat/Cap', quantity: '1', description: 'Sun protection for outdoor time', priority: 'recommended' });

  if (trip_type.toLowerCase() === 'business') {
    addOrPromote(clothing, { item: 'Business attire', quantity: qty(clamp(ceil(days / 2), 1, 4), 'outfits'), description: 'Blazer/jacket with slacks/skirt for meetings', priority: 'essential' });
    addOrPromote(clothing, { item: 'Dress shoes', quantity: '1 pair', description: 'Closed-toe shoes suitable for meetings', priority: 'recommended' });
  }

  const toiletries: PackingItem[] = [
    { item: 'Toothbrush & toothpaste', quantity: '1 set', description: 'Daily dental hygiene', priority: 'essential' },
    { item: 'Deodorant', quantity: '1', description: 'Personal hygiene', priority: 'essential' },
    { item: 'Sunscreen SPF 30+', quantity: '1 bottle', description: 'UV protection during outdoor activities', priority: season === 'summer' ? 'essential' : 'recommended' },
    { item: 'Shampoo/Conditioner (travel size)', quantity: '1 set', description: 'Hair care in carry-on-friendly sizes', priority: 'recommended' },
    { item: 'Basic makeup & skincare', quantity: 'As needed', description: 'Daily routine essentials', priority: 'optional' },
  ];

  const electronics: PackingItem[] = [
    { item: 'Phone + charger', quantity: '1', description: 'Connectivity and travel apps', priority: 'essential' },
    { item: 'Portable power bank', quantity: '1', description: 'Backup power for long days', priority: 'recommended' },
    { item: 'Universal travel adapter', quantity: '1', description: 'Plug and voltage compatibility in many regions', priority: 'essential' },
  ];
  if (trip_type.toLowerCase() === 'business') {
    addOrPromote(electronics, { item: 'Laptop + charger', quantity: '1', description: 'Work and presentations', priority: 'essential' });
    addOrPromote(electronics, { item: 'Presentation clicker/HDMI adaptor', quantity: '1', description: 'Smooth meeting setups', priority: 'recommended' });
  }

  const documents: PackingItem[] = [
    { item: 'Passport/ID', quantity: '1', description: 'Primary identification for travel', priority: 'essential' },
    { item: 'Travel insurance', quantity: '1 policy', description: 'Coverage for emergencies and disruptions', priority: 'essential' },
    { item: 'Itineraries & reservations', quantity: '1 set', description: 'Flight, hotel, and booking confirmations', priority: 'essential' },
    { item: 'Payment methods', quantity: 'Cards + some cash', description: 'Local currency and backup card', priority: 'essential' },
  ];

  const health_safety: PackingItem[] = [
    { item: 'Personal medications', quantity: 'Sufficient for trip', description: 'Bring prescriptions and a few spare days', priority: 'essential' },
    { item: 'Mini first aid kit', quantity: '1 small kit', description: 'Plasters, pain reliever, antiseptic wipes', priority: 'recommended' },
    { item: 'Hand sanitizer', quantity: '1 small bottle', description: 'Hygiene when soap/water unavailable', priority: 'recommended' },
  ];

  const activity_specific: PackingItem[] = [];
  const miscellaneous: PackingItem[] = [
    { item: 'Reusable water bottle', quantity: '1', description: 'Stay hydrated while exploring', priority: 'recommended' },
    { item: 'Daypack', quantity: '1', description: 'Carry essentials on day trips', priority: 'recommended' },
    { item: 'Travel pillow', quantity: '1', description: 'Comfort on flights or long rides', priority: 'optional' },
    { item: 'Laundry detergent sheets', quantity: '2-3', description: 'Quick sink washes on longer trips', priority: 'optional' },
  ];

  return { clothing, toiletries, electronics, documents, health_safety, activity_specific, miscellaneous };
}

function addActivityItems(list: PackingList, input: GeneratorInput) {
  const acts = input.activities.toLowerCase();

  const add = (item: PackingItem) => addOrPromote(list.activity_specific, item);

  if (acts.includes('hiking')) {
    add({ item: 'Hiking boots/shoes', quantity: '1 pair', description: 'Trail-appropriate footwear with grip', priority: 'essential' });
    add({ item: 'Moisture-wicking socks', quantity: '2-3 pairs', description: 'Reduce blisters on trails', priority: 'recommended' });
    add({ item: 'Trekking poles', quantity: '1 pair', description: 'Stability on uneven terrain', priority: 'optional' });
    add({ item: 'Trail snacks', quantity: '2-3 packs', description: 'Energy for longer hikes', priority: 'recommended' });
    add({ item: 'Rain jacket', quantity: '1', description: 'Weather protection in the mountains', priority: input.season === 'summer' ? 'recommended' : 'essential' });
  }
  if (acts.includes('beach') || acts.includes('swimming')) {
    add({ item: 'Swimwear', quantity: '2-3', description: 'Quick-dry suits for beach/pool', priority: 'essential' });
    add({ item: 'Reef-safe sunscreen', quantity: '1 bottle', description: 'Sun protection that’s ocean-friendly', priority: 'essential' });
    add({ item: 'Water shoes', quantity: '1 pair', description: 'Protect feet on rocky shores', priority: 'optional' });
    add({ item: 'Microfiber towel', quantity: '1', description: 'Fast-drying beach or hostel towel', priority: 'recommended' });
  }
  if (acts.includes('diving') || acts.includes('snorkel')) {
    add({ item: 'Snorkel mask', quantity: '1', description: 'Better fit and hygiene than rentals', priority: 'recommended' });
    add({ item: 'Dry bag', quantity: '1', description: 'Keep valuables dry on boats', priority: 'recommended' });
  }
  if (acts.includes('ski') || acts.includes('snowboard')) {
    add({ item: 'Thermal base layers', quantity: '2-3 sets', description: 'Warmth and moisture control', priority: 'essential' });
    add({ item: 'Ski gloves', quantity: '1 pair', description: 'Insulated waterproof gloves', priority: 'essential' });
    add({ item: 'Goggles', quantity: '1', description: 'Visibility in snow and wind', priority: 'recommended' });
    add({ item: 'Ski socks', quantity: '2-3 pairs', description: 'Cushioned socks for boots', priority: 'recommended' });
  }
  if (acts.includes('photography')) {
    add({ item: 'Camera + charger', quantity: '1', description: 'Capture high-quality shots', priority: 'recommended' });
    add({ item: 'Spare batteries & SD cards', quantity: '2-3', description: 'Avoid running out of storage/power', priority: 'recommended' });
  }
  if (acts.includes('business') || input.trip_type.toLowerCase() === 'business') {
    add({ item: 'Business cards', quantity: '10-20', description: 'Networking at meetings/events', priority: 'optional' });
    add({ item: 'Collapsible garment bag', quantity: '1', description: 'Keep suits/dresses wrinkle-free', priority: 'optional' });
  }
}

function ensureWeatherSpecifics(list: PackingList, input: GeneratorInput) {
  if (input.season === 'spring' || input.season === 'autumn') {
    addOrPromote(list.clothing, { item: 'Light rain jacket', quantity: '1', description: 'Showers are common in shoulder seasons', priority: 'recommended' });
  }
  if (input.season === 'summer') {
    addOrPromote(list.toiletries, { item: 'After-sun lotion', quantity: '1 small', description: 'Soothe sun-exposed skin', priority: 'optional' });
  }
  if (input.season === 'winter') {
    addOrPromote(list.clothing, { item: 'Thermal base layers', quantity: '2-3 sets', description: 'Stay warm in cold climates', priority: 'essential' });
    addOrPromote(list.clothing, { item: 'Warm hat and gloves', quantity: '1 set', description: 'Prevent heat loss outdoors', priority: 'essential' });
    addOrPromote(list.toiletries, { item: 'Lip balm & moisturizer', quantity: '1 each', description: 'Protect against dry, cold air', priority: 'recommended' });
  }
}

function finalizeTips(input: GeneratorInput): string[] {
  const tips: string[] = [
    'Roll clothes to save space and minimize wrinkles',
    'Pack versatile layers that mix and match',
    'Keep essentials and documents in your carry-on',
  ];
  if (input.days >= 10) tips.push('Plan a laundry day to reduce how much you pack');
  if (input.season !== 'winter') tips.push('Carry a reusable water bottle and refill often');
  if (input.trip_type.toLowerCase() === 'business') tips.push('Pack extra chargers and a backup presentation on a USB stick');
  return tips.slice(0, 6);
}

export function buildHeuristicPackingResponse(input: GeneratorInput): PackingResponse {
  const base = commonBasics(input);
  addActivityItems(base, input);
  ensureWeatherSpecifics(base, input);

  const destination_notes = `${input.destination}: ${input.days}-day ${input.trip_type} trip in ${input.season}. Quantities scaled by duration; activities and season adjusted.`;
  const packing_tips = finalizeTips(input);

  // Provide minimal destination details without external calls
  const destination_details: DestinationDetails = {
    overview: 'Popular travel spot with local customs and diverse food.',
    best_time_to_visit: input.season === 'summer' ? 'Summer for festivals; shoulder seasons for fewer crowds.' : 'Shoulder seasons for mild weather and fewer crowds.',
    weather_summary: input.season === 'winter' ? 'Cold; pack warm layers.' : input.season === 'summer' ? 'Warm; stay sun-safe.' : 'Variable; bring light layers and rain shell.',
    cultural_tips: 'Be polite and observe local etiquette; learn a few phrases.',
    local_transport: 'Use public transit or rideshare where available.',
    currency: 'Carry a card plus some local cash.',
    language: 'Local language; basic phrases help.',
    power_plugs: 'Carry a universal travel adapter.',
    safety_tips: 'Stay aware of belongings; use hotel safe when possible.',
  };

  return {
    packing_list: base,
    packing_tips,
    destination_notes,
    destination_details,
  };
}

export function enhanceWithHeuristics(ai: PackingResponse, input: GeneratorInput): PackingResponse {
  // Start from AI output and promote with rules
  const merged: PackingList = {
    clothing: [],
    toiletries: [],
    electronics: [],
    documents: [],
    health_safety: [],
    activity_specific: [],
    miscellaneous: [],
  };

  // Seed with AI items
  (Object.keys(merged) as (keyof PackingList)[]).forEach((k) => {
    const items = (ai.packing_list[k] || []) as PackingItem[];
    items.forEach((it) => addOrPromote(merged[k], it));
  });

  // Ensure baseline essentials and season/activity specifics
  const baseline = commonBasics(input);
  (Object.keys(merged) as (keyof PackingList)[]).forEach((k) => {
    baseline[k].forEach((it) => addOrPromote(merged[k], it));
  });
  addActivityItems(merged, input);
  ensureWeatherSpecifics(merged, input);

  // Light normalization: cap description length to ~25 words
  const capDesc = (d: string) => {
    const words = d.split(/\s+/);
    return words.length > 25 ? words.slice(0, 25).join(' ') : d;
  };
  (Object.keys(merged) as (keyof PackingList)[]).forEach((k) => {
    merged[k] = merged[k].map((it) => ({ ...it, description: capDesc(it.description || '') }));
  });

  // Compose tips: prefer AI tips then add heuristics
  const heuristicTips = finalizeTips(input);
  const tipsSet = new Set<string>();
  const tips: string[] = [];
  (ai.packing_tips || []).concat(heuristicTips).forEach((t) => {
    const trimmed = (t || '').trim();
    if (trimmed && !tipsSet.has(trimmed.toLowerCase())) {
      tipsSet.add(trimmed.toLowerCase());
      tips.push(trimmed);
    }
  });

  // Destination notes: prefer AI but ensure concise fallback
  const destination_notes = (ai.destination_notes && ai.destination_notes.length > 0)
    ? ai.destination_notes
    : `${input.destination}: ${input.days}-day ${input.trip_type} in ${input.season}. Quantities scaled by duration.`;

  const destination_details = ai.destination_details || {
    overview: 'Popular travel spot with local customs and diverse food.',
    best_time_to_visit: input.season === 'summer' ? 'Summer for festivals; shoulder seasons for fewer crowds.' : 'Shoulder seasons for mild weather and fewer crowds.',
    weather_summary: input.season === 'winter' ? 'Cold; pack warm layers.' : input.season === 'summer' ? 'Warm; stay sun-safe.' : 'Variable; bring light layers and rain shell.',
    cultural_tips: 'Be polite and observe local etiquette; learn a few phrases.',
    local_transport: 'Use public transit or rideshare where available.',
    currency: 'Carry a card plus some local cash.',
    language: 'Local language; basic phrases help.',
    power_plugs: 'Carry a universal travel adapter.',
    safety_tips: 'Stay aware of belongings; use hotel safe when possible.',
  };

  return {
    packing_list: merged,
    packing_tips: tips.slice(0, 8),
    destination_notes,
    destination_details,
  };
}
