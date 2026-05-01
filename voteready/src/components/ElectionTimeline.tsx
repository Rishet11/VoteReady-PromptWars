import { CheckCircle2, Circle } from 'lucide-react';
import { electionTimeline } from '@/data/electionTimeline';
import { cn } from '@/lib/utils';

interface ElectionTimelineProps {
  className?: string;
}

export function ElectionTimeline({ className }: ElectionTimelineProps) {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm", className)}>
      <h3 className="text-lg font-bold text-gray-900 mb-6">How The Process Works</h3>
      
      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
        {electionTimeline.map((step) => {
          
          return (
            <div key={step.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute -left-[11px] top-1 bg-white">
                {step.actionRequired ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 bg-white" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 fill-white" />
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  {step.title}
                  {step.actionRequired && (
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Action Required
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
