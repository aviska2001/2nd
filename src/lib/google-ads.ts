// Google Ads utility functions
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

// Track initialized ad slots to prevent double initialization
const initializedSlots = new Set<string>();

export function isAdSlotInitialized(slot: string): boolean {
  return initializedSlots.has(slot);
}

export function markAdSlotAsInitialized(slot: string): void {
  initializedSlots.add(slot);
}

export function initializeGoogleAd(element: HTMLElement, slot: string): boolean {
  try {
    // Check if Google AdSense script is loaded
    if (typeof window === 'undefined' || !window.adsbygoogle) {
      console.warn('Google AdSense script not loaded yet');
      return false;
    }

    // Check if this specific element already has ads
    const adStatus = element.getAttribute('data-adsbygoogle-status');
    if (adStatus && adStatus !== 'reserved') {
      console.warn(`Ad slot ${slot} already initialized`);
      return false;
    }

    // Check if this slot was already initialized globally
    if (isAdSlotInitialized(slot)) {
      console.warn(`Ad slot ${slot} already marked as initialized`);
      return false;
    }

    // Initialize the ad
    window.adsbygoogle.push({});
    markAdSlotAsInitialized(slot);
    
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Google Ad initialization failed:', error);
    }
    return false;
  }
}

export function resetAdSlot(slot: string): void {
  initializedSlots.delete(slot);
}
