import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDirectionsUrl } from '@/lib/mapsUtils';
import type { PollingPlace } from '@/data/pinToState';
import { GoogleMapsEmbed } from './GoogleMapsEmbed';

interface PollingPlaceCardProps {
  pollingPlace: PollingPlace;
  className?: string;
}

export function PollingPlaceCard({ pollingPlace, className }: PollingPlaceCardProps) {
  const directionsUrl = getDirectionsUrl(pollingPlace.lat, pollingPlace.lng);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-gray-500" />
        Where You Vote
      </h3>
      
      <div className="flex flex-col md:flex-row gap-6 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-hidden">
        {/* Address Details */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-lg mb-1">{pollingPlace.name}</p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {pollingPlace.address}<br />
              {pollingPlace.city}, {pollingPlace.pin}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-3 inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md">
              <Navigation className="w-3.5 h-3.5" />
              {pollingPlace.distance} miles away
            </p>
          </div>
          
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none focus:underline"
            aria-label={`Get directions to ${pollingPlace.name} on Google Maps`}
          >
            [Get Directions]
          </a>
        </div>
        
        {/* Map Embed */}
        <div className="w-full md:w-1/2 min-h-[200px] md:min-h-full">
          <GoogleMapsEmbed 
            lat={pollingPlace.lat} 
            lng={pollingPlace.lng} 
            title={pollingPlace.name}
            className="w-full h-full min-h-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
