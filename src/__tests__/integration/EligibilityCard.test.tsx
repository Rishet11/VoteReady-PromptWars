import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EligibilityCard } from '@/components/EligibilityCard';
import { electionData } from '@/data/electionData';

describe('EligibilityCard', () => {
  const mockState = electionData['DL']!; // Delhi

  it('renders correctly with state data', () => {
    render(<EligibilityCard stateData={mockState} />);
    
    // Check if the state name is rendered
    expect(screen.getByText(/Delhi/i)).toBeInTheDocument();
    
    // Check if the base eligibility text is present
    expect(screen.getByText(/You're eligible if you're an Indian citizen/i)).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<EligibilityCard stateData={mockState} />);
    
    // The card should have role="status" and aria-live="polite"
    const card = screen.getByRole('status');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('aria-live', 'polite');
  });
});
