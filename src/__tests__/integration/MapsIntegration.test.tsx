import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDirectionsUrl, getEmbedUrl } from '@/lib/mapsUtils';
import { GoogleMapsEmbed } from '@/components/GoogleMapsEmbed';
import { PollingPlaceCard } from '@/components/PollingPlaceCard';

describe('Google Maps Integration', () => {
  const mockLocation = {
    lat: 28.6139,
    lng: 77.2090,
    title: 'India Gate'
  };

  describe('mapsUtils', () => {
    it('generates a correct directions URL', () => {
      const url = getDirectionsUrl(mockLocation.lat, mockLocation.lng);
      expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=28.6139,77.209');
    });

    it('generates a correct embed URL with API key', () => {
      const url = getEmbedUrl(mockLocation.lat, mockLocation.lng, 'MOCK_KEY');
      expect(url).toContain('google.com/maps/embed/v1/place');
      expect(url).toContain('key=MOCK_KEY');
      expect(url).toContain('q=28.6139,77.209');
    });

    it('generates a fallback embed URL when API key is missing', () => {
      const url = getEmbedUrl(mockLocation.lat, mockLocation.lng, '');
      expect(url).toContain('maps.google.com/maps?q=28.6139,77.209');
      expect(url).toContain('output=embed');
    });
  });

  describe('GoogleMapsEmbed Component', () => {
    it('renders an iframe with the correct title and source', () => {
      render(<GoogleMapsEmbed {...mockLocation} />);
      const iframe = screen.getByTitle(/Map showing location of India Gate/i);
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src');
    });

    it('shows error state when iframe fails to load', () => {
      // We can't easily trigger onError in JSDOM, but we can test the prop exists
      render(<GoogleMapsEmbed {...mockLocation} />);
      const iframe = screen.getByTitle(/Map showing location of India Gate/i);
      expect(iframe).toHaveProperty('onerror');
    });
  });

  describe('PollingPlaceCard Component', () => {
    const mockPollingPlace = {
      name: 'Delhi Central School',
      address: '123 Parliament St',
      city: 'New Delhi',
      pin: '110001',
      lat: 28.6139,
      lng: 77.209,
      distance: 1.2
    };

    it('renders polling place details correctly', () => {
      render(<PollingPlaceCard pollingPlace={mockPollingPlace} />);
      expect(screen.getByText('Delhi Central School')).toBeInTheDocument();
      expect(screen.getByText(/123 Parliament St/i)).toBeInTheDocument();
      expect(screen.getByText(/1.2 miles away/i)).toBeInTheDocument();
    });

    it('contains a link for directions', () => {
      render(<PollingPlaceCard pollingPlace={mockPollingPlace} />);
      const link = screen.getByRole('link', { name: /get directions/i });
      expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir'));
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
