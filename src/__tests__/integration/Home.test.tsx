import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';

describe('Home page flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function enterPin(pin: string) {
    fireEvent.change(screen.getByLabelText(/where are you registered/i), {
      target: { value: pin },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
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

    expect(screen.getByText(/ordinary resident of/i)).toHaveTextContent('Delhi');
    expect(screen.getByText(/Register by May 15, 2026/i)).toBeInTheDocument();
  });

  it('opens the state picker for an unmapped PIN', async () => {
    render(<Home />);

    await enterPin('999999');

    expect(screen.getByRole('dialog', { name: /select your state/i })).toBeInTheDocument();
  });
});
