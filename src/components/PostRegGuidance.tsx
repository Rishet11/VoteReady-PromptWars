import { useState, useEffect, useCallback } from 'react';
import { Bot, AlertCircle, RefreshCcw, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StateElectionData } from '@/data/electionData';
import { LanguageSelector } from './LanguageSelector';
import type { SupportedLanguageCode } from '@/lib/languages';

interface PostRegGuidanceProps {
  stateData: StateElectionData;
  className?: string;
}

interface GuidanceApiResponse {
  guidance: string;
  fallback: boolean;
  cached: boolean;
  language: SupportedLanguageCode;
  translated: boolean;
  source: 'gemini' | 'standard';
}

export function PostRegGuidance({ stateData, className }: PostRegGuidanceProps) {
  const [guidance, setGuidance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [isTranslated, setIsTranslated] = useState<boolean>(true);
  const [language, setLanguage] = useState<SupportedLanguageCode>('en');

  const fetchGuidance = useCallback(async (targetLang: SupportedLanguageCode) => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch('/api/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stateCode: stateData.code,
          language: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guidance');
      }

      const data = (await response.json()) as GuidanceApiResponse;
      setGuidance(data.guidance);
      setIsFallback(data.fallback);
      setIsTranslated(data.translated);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [stateData.code]);

  useEffect(() => {
    // Making this truly async to avoid cascading renders
    const timeoutId = setTimeout(() => {
      fetchGuidance(language);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [language, fetchGuidance]);

  const handleLanguageChange = (newLang: SupportedLanguageCode) => {
    setLanguage(newLang);
  };

  const handleRetry = () => {
    void fetchGuidance(language);
  };

  const showEnglishFallbackNotice = language !== 'en' && !isTranslated;

  return (
    <div className={cn("bg-indigo-50 border border-indigo-100 rounded-xl p-5 md:p-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-indigo-900">
          <Bot className="w-6 h-6" />
          <h2 className="text-lg font-bold text-nowrap">What Happens Next?</h2>
        </div>

        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
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
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white/80 rounded-lg p-5 shadow-sm border border-indigo-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Languages className="w-12 h-12" />
          </div>
          <div className="whitespace-pre-wrap text-gray-800 text-sm md:text-base leading-relaxed font-medium relative z-10">
            {guidance}
          </div>
          {isFallback && (
            <p className="mt-4 text-xs text-gray-500 italic">
              Showing standard guidance.
            </p>
          )}
          {showEnglishFallbackNotice && (
            <p className="mt-4 text-xs text-gray-500 italic">
              Showing English because translation is temporarily unavailable.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
