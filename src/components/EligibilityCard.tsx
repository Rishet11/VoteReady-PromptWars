import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StateElectionData } from '@/data/electionData';

interface EligibilityCardProps {
  stateData: StateElectionData;
  className?: string;
}

export function EligibilityCard({ stateData, className }: EligibilityCardProps) {
  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 animate-in fade-in slide-in-from-bottom-2 duration-500", 
        className
      )}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm md:text-base font-medium leading-relaxed">
        You&apos;re eligible if you&apos;re an Indian citizen, 18+, and a {stateData.name} resident for {stateData.residencyDays}+ days.
      </p>
    </div>
  );
}
