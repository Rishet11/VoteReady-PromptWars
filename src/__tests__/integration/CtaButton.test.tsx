import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CtaButton } from '@/components/CtaButton';

describe('CtaButton', () => {
  it('renders correctly with given url', () => {
    render(<CtaButton url="https://voters.eci.gov.in" />);
    
    const button = screen.getByRole('link', { name: /Register to vote on the official portal/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', 'https://voters.eci.gov.in');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<CtaButton url="https://voters.eci.gov.in" onClick={handleClick} />);
    
    const button = screen.getByRole('link');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles click when onClick is not provided', () => {
    render(<CtaButton url="https://voters.eci.gov.in" />);
    const button = screen.getByRole('link');
    fireEvent.click(button);
    // Should not throw, and should trigger trackEvent
  });

  it('shows loading state and resets after timeout', () => {
    vi.useFakeTimers();
    render(<CtaButton url="https://voters.eci.gov.in" />);
    
    const button = screen.getByRole('link');
    fireEvent.click(button);
    
    expect(button.textContent).not.toContain('Register Now');
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(button.textContent).toContain('Register Now');
    vi.useRealTimers();
  });
});
