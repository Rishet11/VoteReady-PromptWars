import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
