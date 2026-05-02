import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PostRegGuidance } from '@/components/PostRegGuidance';
import { electionData } from '@/data/electionData';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PostRegGuidance', () => {
  const mockState = electionData['DL'];

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('shows loading skeleton initially', () => {
    // Return a promise that doesn't resolve immediately
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<PostRegGuidance stateData={mockState} />);
    expect(screen.getByLabelText('Loading guidance...')).toBeInTheDocument();
  });

  it('renders guidance after fetch succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        guidance: 'This is test guidance.',
        fallback: false,
        cached: false,
        language: 'en',
        translated: true,
        source: 'gemini',
      }),
    });

    render(<PostRegGuidance stateData={mockState} />);
    
    await waitFor(() => {
      expect(screen.getByText('This is test guidance.')).toBeInTheDocument();
    });
  });

  it('shows error state if fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<PostRegGuidance stateData={mockState} />);
    
    await waitFor(() => {
      expect(screen.getByText(/We couldn't load your personalized guidance right now/i)).toBeInTheDocument();
    });
  });

  it('requests guidance in the selected language', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          guidance: 'English guidance.',
          fallback: false,
          cached: false,
          language: 'en',
          translated: true,
          source: 'gemini',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          guidance: 'Hindi guidance.',
          fallback: false,
          cached: false,
          language: 'hi',
          translated: true,
          source: 'gemini',
        }),
      });

    render(<PostRegGuidance stateData={mockState} />);

    await screen.findByText('English guidance.');
    fireEvent.click(screen.getByRole('button', { name: /show guidance in hindi/i }));

    await screen.findByText('Hindi guidance.');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/guidance', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ stateCode: 'DL', language: 'hi' }),
    }));
  });

  it('explains when translated guidance falls back to English', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        guidance: 'English fallback.',
        fallback: false,
        cached: false,
        language: 'hi',
        translated: false,
        source: 'gemini',
      }),
    });

    render(<PostRegGuidance stateData={mockState} />);
    fireEvent.click(screen.getByRole('button', { name: /show guidance in hindi/i }));

    await screen.findByText('English fallback.');
    expect(screen.getByText(/translation is temporarily unavailable/i)).toBeInTheDocument();
  });
});
