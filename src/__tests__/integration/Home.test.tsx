import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';

describe('Home page flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    vi.stubGlobal('fetch', vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as { pin?: string };
      if (body.pin === '110001') {
        return new Response(JSON.stringify({
          found: true,
          cached: false,
          mapping: {
            state: 'DL',
            pollingPlace: {
              name: 'NDMC Primary School',
              address: 'Connaught Place',
              city: 'New Delhi',
              pin: '110001',
              lat: 28.6315,
              lng: 77.2167,
              distance: 0.3,
            },
          },
        }), { status: 200 });
      }

      return new Response(JSON.stringify({ found: false, cached: false }), { status: 200 });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  async function enterPin(pin: string) {
    fireEvent.change(screen.getByLabelText(/where are you registered/i), {
      target: { value: pin },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  it('renders the initial search screen', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'VoteReady' })).toBeInTheDocument();
    expect(screen.getByLabelText(/where are you registered/i)).toBeInTheDocument();
  });

  it('shows active state details after a valid mapped PIN', async () => {
    render(<Home />);

    await enterPin('110001');

    expect(screen.getByText(/Delhi resident/i)).toHaveTextContent('180+ days');
    expect(screen.getByText(/Register by May 15, 2026/i)).toBeInTheDocument();
  });

  it('opens the state picker for an unmapped PIN and selects a state', async () => {
    render(<Home />);

    await enterPin('999999');

    expect(screen.getByRole('dialog', { name: /select your state/i })).toBeInTheDocument();
    
    // Select a state (e.g., Delhi)
    const radio = screen.getByRole('radio', { name: /Delhi/i });
    fireEvent.click(radio);
    
    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /Confirm Selection/i });
    fireEvent.click(confirmButton);
    
    // Verify modal is closed and state details are shown
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Delhi resident/i)).toBeInTheDocument();
  });

  it('opens the state picker when API returns 500 error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 500 })));
    render(<Home />);
    await enterPin('110001');
    expect(screen.getByRole('dialog', { name: /select your state/i })).toBeInTheDocument();
  });

  it('opens the state picker when API returns an error JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Server error' }), { status: 200 })));
    render(<Home />);
    await enterPin('110001');
    expect(screen.getByRole('dialog', { name: /select your state/i })).toBeInTheDocument();
  });

  it('shows guidance after clicking register', async () => {
    render(<Home />);
    await enterPin('110001');
    
    const ctaButton = screen.getByRole('link', { name: /register to vote/i });
    fireEvent.click(ctaButton);
    
    expect(screen.getByText(/Heading to Delhi's registration portal/i)).toBeInTheDocument();
  });

  it('ignores stale API responses due to race conditions', async () => {
    let resolveFirst: (val: Response) => void;
    const firstPromise = new Promise<Response>(r => { resolveFirst = r; });
    
    vi.stubGlobal('fetch', vi.fn()
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(Promise.resolve(new Response(JSON.stringify({ found: false, cached: false }), { status: 200 })))
    );

    render(<Home />);
    
    // Type first pin
    fireEvent.change(screen.getByLabelText(/where are you registered/i), { target: { value: '110001' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    
    // Type second pin immediately
    fireEvent.change(screen.getByLabelText(/where are you registered/i), { target: { value: '220002' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    
    // Resolve first pin (should be ignored)
    await act(async () => {
      resolveFirst!(new Response(JSON.stringify({ found: true, cached: false, mapping: { state: 'DL', pollingPlace: null } }), { status: 200 }));
      await Promise.resolve();
    });

    // We should see the state picker because 220002 is not found, and the DL state should NOT be set
    expect(screen.getByRole('dialog', { name: /select your state/i })).toBeInTheDocument();
    expect(screen.queryByText(/Delhi resident/i)).not.toBeInTheDocument();
  });
});
