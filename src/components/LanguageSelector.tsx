'use client';

import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '@/lib/languages';
import { trackEvent } from './GoogleAnalytics';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguageCode;
  onLanguageChange: (lang: SupportedLanguageCode) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">Language:</span>
      <div className="flex flex-wrap gap-1.5">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            type="button"
            key={lang.code}
            aria-pressed={currentLanguage === lang.code}
            aria-label={`Show guidance in ${lang.name}`}
            onClick={() => {
              onLanguageChange(lang.code);
              trackEvent('language_change', 'ui', lang.code);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all border ${
              currentLanguage === lang.code
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
