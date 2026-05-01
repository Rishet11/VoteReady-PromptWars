export function SkipLink() {
  return (
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md font-bold shadow-lg outline-none ring-2 ring-white"
    >
      Skip to main content
    </a>
  );
}
