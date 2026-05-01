import { useState, useEffect, useCallback } from 'react';
import { Bot, AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StateElectionData } from '@/data/electionData';

interface PostRegGuidanceProps {
  stateData: StateElectionData;
  className?: string;
}

export function PostRegGuidance({ stateData, className }: PostRegGuidanceProps) {
  const [guidance, setGuidance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const fetchGuidance = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stateCode: stateData.code }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guidance');
      }

      const data = await response.json();
      setGuidance(data.guidance);
      if (data.fallback) {
        setIsFallback(true);
      }
      // Intentionally prefixed with _ to indicate unused error parameter
    } catch (_err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [stateData.code]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGuidance();
  }, [fetchGuidance]);

  return (
    <div className={cn("bg-indigo-50 border border-indigo-100 rounded-xl p-5 md:p-6", className)}>
      <div className="flex items-center gap-2 mb-4 text-indigo-900">
        <Bot className="w-6 h-6" />
        <h2 className="text-lg font-bold">What Happens Next?</h2>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse" aria-label="Loading guidance...">
          <div className="h-4 bg-indigo-200/50 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200/50 rounded w-1/2"></div>
          <div className="h-4 bg-indigo-200/50 rounded w-5/6"></div>
          <div className="h-4 bg-indigo-200/50 rounded w-2/3"></div>
        </div>
      ) : error ? (
        <div className="bg-white/60 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500 opacity-80" />
          <p className="text-sm text-gray-700">We couldn&apos;t load your personalized guidance right now.</p>
          <button 
            onClick={fetchGuidance}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white/80 rounded-lg p-5 shadow-sm border border-indigo-50/50">
          <div className="whitespace-pre-wrap text-gray-800 text-sm md:text-base leading-relaxed font-medium">
            {guidance}
          </div>
          {isFallback && (
            <p className="mt-4 text-xs text-gray-500 italic">
              Showing standard guidance.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
