import { AlertTriangle, Clock } from 'lucide-react';
import { cn, calculateDaysRemaining, formatDate } from '@/lib/utils';
import type { StateElectionData } from '@/data/electionData';
import { CalendarButton } from './CalendarButton';

interface DeadlineCardProps {
  stateData: StateElectionData;
  className?: string;
}

export function DeadlineCard({ stateData, className }: DeadlineCardProps) {
  const daysLeft = calculateDaysRemaining(stateData.deadline);
  const isExpired = daysLeft < 0;
  
  return (
    <div className={cn("flex flex-col border rounded-xl overflow-hidden shadow-sm", className)}>
      {/* Header */}
      <div className="bg-gray-900 text-white px-5 py-3 font-bold tracking-wide uppercase text-sm md:text-base flex justify-between items-center">
        <span>{stateData.name}</span>
        <span className="text-gray-300 font-medium text-xs md:text-sm">
          {stateData.electionType} • {formatDate(stateData.electionDate)}
        </span>
      </div>
      
      {/* Body */}
      <div className={cn(
        "p-5 md:p-6",
        isExpired ? "bg-red-50" : "bg-orange-50"
      )}>
        <div className="flex gap-3 items-start">
          <AlertTriangle className={cn(
            "w-6 h-6 flex-shrink-0 mt-0.5",
            isExpired ? "text-red-600" : "text-orange-600"
          )} aria-hidden="true" />
          
          <div className="flex flex-col gap-3">
            <h2 className={cn(
              "text-lg md:text-xl font-bold leading-tight",
              isExpired ? "text-red-800" : "text-orange-900"
            )}>
              {isExpired
                ? "The registration deadline for this election has passed."
                : `Register by ${formatDate(stateData.deadline)} or you cannot vote in this election.`
              }
            </h2>

            {!isExpired && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white/50 px-3 py-1.5 rounded-full border border-orange-200">
                  <Clock className="w-4 h-4" />
                  <span>Days left: {daysLeft}</span>
                </div>

                <CalendarButton
                  eventName={`Registration Deadline: ${stateData.name}`}
                  eventDate={stateData.deadline}
                  description={`Last day to register for the ${stateData.electionType} in ${stateData.name}. Be a voter!`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
