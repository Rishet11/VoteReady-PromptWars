import { useState, useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { electionData } from '@/data/electionData';

interface StatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectState: (stateCode: string) => void;
}

export function StatePickerModal({ isOpen, onClose, onSelectState }: StatePickerModalProps) {
  const [selected, setSelected] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap could be added here for strict a11y, simplified for now
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const states = Object.values(electionData).sort((a, b) => a.name.localeCompare(b.name));

  const handleConfirm = () => {
    if (selected) {
      onSelectState(selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Select Your State
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">
            We couldn't find your PIN code in our demo database. Please select your state directly:
          </p>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto p-1">
            {states.map((state) => (
              <label 
                key={state.code}
                className={cn(
                  "flex items-center p-3 border rounded-lg cursor-pointer transition-all",
                  selected === state.code 
                    ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <input
                  type="radio"
                  name="state-selection"
                  value={state.code}
                  checked={selected === state.code}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-gray-900">{state.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
