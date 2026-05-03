import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PinInput } from '@/components/PinInput';

describe('PinInput Component', () => {
  it('calls onPinChange with false when an invalid pin is entered and debounced', async () => {
    vi.useFakeTimers();
    const handlePinChange = vi.fn();
    render(<PinInput onPinChange={handlePinChange} />);
    
    const input = screen.getByTestId('pin-input');
    fireEvent.change(input, { target: { value: '123' } });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(handlePinChange).toHaveBeenCalledWith('123', false);
    expect(screen.getByText('Please enter a valid 6-digit PIN code')).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('handles SEARCH button click for valid pin', () => {
    const handlePinChange = vi.fn();
    render(<PinInput onPinChange={handlePinChange} />);
    
    const input = screen.getByTestId('pin-input');
    fireEvent.change(input, { target: { value: '110001' } });
    
    const button = screen.getByRole('button', { name: /Search PIN code/i });
    fireEvent.click(button);
    
    expect(handlePinChange).toHaveBeenCalledWith('110001', true);
  });

  it('handles SEARCH button click for invalid pin', () => {
    const handlePinChange = vi.fn();
    render(<PinInput onPinChange={handlePinChange} />);
    
    const input = screen.getByTestId('pin-input');
    fireEvent.change(input, { target: { value: '123' } });
    
    const button = screen.getByRole('button', { name: /Search PIN code/i });
    fireEvent.click(button);
    
    expect(handlePinChange).toHaveBeenCalledWith('123', false);
    expect(screen.getByText('Please enter a valid 6-digit PIN code')).toBeInTheDocument();
  });

  it('calls onPinChange with true when a valid pin is entered and debounced', async () => {
    vi.useFakeTimers();
    const handlePinChange = vi.fn();
    render(<PinInput onPinChange={handlePinChange} />);
    
    const input = screen.getByTestId('pin-input');
    fireEvent.change(input, { target: { value: '110001' } });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(handlePinChange).toHaveBeenCalledWith('110001', true);
    expect(screen.queryByText('Please enter a valid 6-digit PIN code')).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('calls onPinChange with empty string when input is cleared and debounced', async () => {
    vi.useFakeTimers();
    const handlePinChange = vi.fn();
    render(<PinInput onPinChange={handlePinChange} />);
    
    const input = screen.getByTestId('pin-input');
    fireEvent.change(input, { target: { value: '' } });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(handlePinChange).toHaveBeenCalledWith('', false);
    expect(screen.queryByText('Please enter a valid 6-digit PIN code')).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });
});
