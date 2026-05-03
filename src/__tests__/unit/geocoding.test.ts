import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolvePinToState } from '@/lib/geocoding';

global.fetch = vi.fn();

describe('geocoding utility', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'MOCK_KEY';
  });

  it('resolves a valid PIN to a state and coordinates', async () => {
    const mockResponse = {
      status: 'OK',
      results: [{
        address_components: [
          { long_name: 'Delhi', types: ['administrative_area_level_1'] }
        ],
        geometry: {
          location: { lat: 28.6139, lng: 77.2090 }
        },
        formatted_address: 'New Delhi, Delhi 110001, India'
      }]
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await resolvePinToState('110001');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state).toBe('DL');
      expect(result.value.lat).toBe(28.6139);
    }
  });

  it('returns error when API key is missing', async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const result = await resolvePinToState('110001');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Missing API Key');
    }
  });

  it('returns error when API status is not OK', async () => {
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ status: 'ZERO_RESULTS', results: [] })
    });

    const result = await resolvePinToState('000000');
    expect(result.ok).toBe(false);
  });

  it('returns error on fetch failure', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));
    const result = await resolvePinToState('110001');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Geocoding request error');
    }
  });

  it('returns error when state component is missing in results', async () => {
    const mockResponse = {
      status: 'OK',
      results: [{
        address_components: [
          { long_name: 'Some Place', types: ['locality'] }
        ],
        geometry: {
          location: { lat: 10, lng: 10 }
        },
        formatted_address: 'Some Address'
      }]
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await resolvePinToState('110001');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('State not found in geocoding results');
    }
  });

  it('falls back to state name if code is not in mapping', async () => {
    const mockResponse = {
      status: 'OK',
      results: [{
        address_components: [
          { long_name: 'Unknown State', types: ['administrative_area_level_1'] }
        ],
        geometry: {
          location: { lat: 10, lng: 10 }
        },
        formatted_address: 'Some Address'
      }]
    };

    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await resolvePinToState('110001');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.state).toBe('Unknown State');
    }
  });
});
