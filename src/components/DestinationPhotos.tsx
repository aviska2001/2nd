'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface DestinationPhoto {
  id: number;
  url: string;
  thumb: string;
  alt: string;
}

interface DestinationPhotosProps {
  destination: string;
  className?: string;
  showSingle?: boolean; // If true, shows only one photo
}

export default function DestinationPhotos({ destination, className = '', showSingle = false }: DestinationPhotosProps) {
  const [photos, setPhotos] = useState<DestinationPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinationPhotos = useCallback(async () => {
    if (!destination.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/destination-photos?destination=${encodeURIComponent(destination)}`);
      const data = await response.json();
      
      if (data.success && data.photos) {
        setPhotos(data.photos);
      } else {
        setError('Failed to load destination photos');
      }
    } catch (err) {
      console.error('Error fetching destination photos:', err);
      setError('Failed to load destination photos');
    } finally {
      setLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    if (destination) {
      fetchDestinationPhotos();
    }
  }, [destination, fetchDestinationPhotos]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading destination photos...</p>
        </div>
      </div>
    );
  }

  if (error || !photos.length) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 text-sm">No photos available for {destination}</p>
        </div>
      </div>
    );
  }

  if (showSingle && photos.length > 0) {
    const photo = photos[0];
    return (
      <div className={`relative rounded-lg overflow-hidden ${className}`}>
        <Image
          src={photo.url}
          alt={photo.alt || `${destination} destination photo`}
          className="w-full h-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-sm font-medium">{destination}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${className}`}>
      {photos.slice(0, 6).map((photo) => (
        <div key={photo.id} className="relative rounded-lg overflow-hidden aspect-square">
          <Image
            src={photo.thumb}
            alt={photo.alt || `${destination} destination photo`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      ))}
    </div>
  );
}