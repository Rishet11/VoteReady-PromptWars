import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CtaButtonProps {
  url: string;
  onClick?: () => void;
  className?: string;
}

export function CtaButton({ url, onClick, className }: CtaButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    // Call the optional onClick handler (e.g. to show post-reg guidance)
    if (onClick) {
      onClick();
    }
    
    // Show brief loading state to give feedback before opening new tab
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <p className="text-[15px] font-medium text-emerald-700">
        You&apos;re almost ready to vote.
      </p>
      
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group relative inline-flex items-center justify-center gap-2 w-full max-w-[300px] bg-blue-600 text-white text-base md:text-lg font-bold px-6 py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Register to vote on the official portal"
      >
        {isNavigating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Be a Voter — Register Now
            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </a>
      
      <p className="text-[13px] italic text-gray-500">
        Most people finish in under 2 minutes.
      </p>
    </div>
  );
}
