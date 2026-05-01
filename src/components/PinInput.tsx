import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { isValidPinCode } from '@/lib/sanitize';

interface PinInputProps {
  onPinChange: (pin: string, isValid: boolean) => void;
  className?: string;
}

export function PinInput({ onPinChange, className }: PinInputProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Debounced change handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (pin.length > 0) {
        if (!isValidPinCode(pin)) {
          setError('Please enter a valid 6-digit PIN code');
          onPinChange(pin, false);
        } else {
          setError('');
          onPinChange(pin, true);
        }
      } else {
        setError('');
        onPinChange('', false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [pin, onPinChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (value.length <= 6) {
      setPin(value);
    }
  };

  return (
    <div className={cn("w-full max-w-sm flex flex-col gap-2", className)}>
      <label htmlFor="pin-input" className="text-sm font-semibold text-gray-700">
        Where are you registered?
      </label>
      <div className="flex gap-2">
        <input
          id="pin-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={handleChange}
          placeholder="Enter 6-digit PIN code"
          aria-describedby={error ? "pin-error" : undefined}
          aria-invalid={!!error}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-lg tracking-wider",
            error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
          )}
        />
        <button 
          className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => {
            const valid = isValidPinCode(pin);
            if (!valid) setError('Please enter a valid 6-digit PIN code');
            onPinChange(pin, valid);
          }}
          aria-label="Search PIN code"
        >
          SEARCH
        </button>
      </div>
      {error && (
        <p id="pin-error" className="text-sm text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
