import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
      json: async () => ({ guidance: 'This is test guidance.' }),
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
});
