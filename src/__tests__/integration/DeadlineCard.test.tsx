import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeadlineCard } from '@/components/DeadlineCard';
import { electionData } from '@/data/electionData';

describe('DeadlineCard', () => {
  const mockState = electionData['DL']!; // Delhi (Deadline: 2026-05-15)

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows days left when deadline is in the future', () => {
    // Mock current date to May 1, 2026
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
    
    render(<DeadlineCard stateData={mockState} />);
    
    expect(screen.getByText(/Delhi/i)).toBeInTheDocument();
    expect(screen.getByText(/Register by May 15, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Days left: 14/i)).toBeInTheDocument();
  });

  it('shows expired message when deadline has passed', () => {
    // Mock current date to May 20, 2026
    vi.setSystemTime(new Date('2026-05-20T12:00:00Z'));
    
    render(<DeadlineCard stateData={mockState} />);
    
    expect(screen.getByText(/The registration deadline for this election has passed/i)).toBeInTheDocument();
    expect(screen.queryByText(/Days left/i)).not.toBeInTheDocument();
  });
});
