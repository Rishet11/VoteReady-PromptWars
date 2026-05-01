import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEmbedUrl } from '@/lib/mapsUtils';

interface GoogleMapsEmbedProps {
  lat: number;
  lng: number;
  title: string;
  className?: string;
}

export function GoogleMapsEmbed({ lat, lng, title, className }: GoogleMapsEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const embedUrl = getEmbedUrl(lat, lng);

  if (hasError) {
    return (
      <div className={cn("bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center p-6 text-center text-gray-500", className)}>
        <MapPin className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Map could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-gray-200 bg-gray-50 relative", className)}>
      {/* Aspect ratio container (16:9) */}
      <div className="absolute inset-0">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing location of ${title}`}
          aria-label={`Polling location map for ${title}`}
          onError={() => setHasError(true)}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
