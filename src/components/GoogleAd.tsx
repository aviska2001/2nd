'use client';

import { useEffect, useRef } from 'react';
import { initializeGoogleAd } from '../lib/google-ads';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface GoogleAdProps {
  slot: string;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export default function GoogleAd({ 
  slot, 
  format = "auto", 
  responsive = true, 
  className = "" 
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations for this component instance
    if (isInitialized.current) return;

    const initializeAd = () => {
      if (adRef.current) {
        const success = initializeGoogleAd(adRef.current, slot);
        if (success) {
          isInitialized.current = true;
        }
      }
    };

    // Small delay to ensure DOM is ready and Google script is loaded
    const timeoutId = setTimeout(initializeAd, 200);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [slot]); // Re-run only if slot changes

  return (
    <div className={`google-ad-container ${className}`}>
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1746703660454482"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}