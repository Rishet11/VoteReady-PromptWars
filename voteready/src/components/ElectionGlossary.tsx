import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { glossaryTerms } from '@/data/glossaryTerms';
import { cn } from '@/lib/utils';

interface ElectionGlossaryProps {
  className?: string;
}

export function ElectionGlossary({ className }: ElectionGlossaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn("border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls="glossary-content"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900 text-lg">Election Glossary</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {isOpen && (
        <div id="glossary-content" className="p-4 md:p-5 border-t border-gray-200">
          <div className="mb-4">
            <label htmlFor="glossary-search" className="sr-only">Search terms</label>
            <input
              id="glossary-search"
              type="text"
              placeholder="Search terms (e.g., EVM, EPIC)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
            {filteredTerms.length > 0 ? (
              filteredTerms.map((item) => (
                <div key={item.term} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <dt className="font-bold text-gray-900 mb-1">{item.term}</dt>
                  <dd className="text-sm text-gray-600 leading-relaxed">{item.definition}</dd>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full">No terms found matching &quot;{searchTerm}&quot;.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
