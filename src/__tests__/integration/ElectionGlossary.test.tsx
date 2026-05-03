import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ElectionGlossary } from '@/components/ElectionGlossary';
import { glossaryTerms } from '@/data/glossaryTerms';

describe('ElectionGlossary Component', () => {
  it('renders closed initially and can be toggled', () => {
    render(<ElectionGlossary />);
    
    // Initially closed
    expect(screen.queryByPlaceholderText(/Search terms/i)).not.toBeInTheDocument();
    
    // Open glossary
    const toggleButton = screen.getByRole('button', { name: /Election Glossary/i });
    fireEvent.click(toggleButton);
    
    // Now open
    expect(screen.getByPlaceholderText(/Search terms/i)).toBeInTheDocument();
    
    // Check if terms are rendered
    expect(screen.getByText(glossaryTerms[0]!.term)).toBeInTheDocument();
    
    // Close glossary
    fireEvent.click(toggleButton);
    expect(screen.queryByPlaceholderText(/Search terms/i)).not.toBeInTheDocument();
  });

  it('filters terms based on search input', () => {
    render(<ElectionGlossary />);
    fireEvent.click(screen.getByRole('button', { name: /Election Glossary/i }));
    
    const searchInput = screen.getByPlaceholderText(/Search terms/i);
    
    // Search for a term that definitely does not exist
    fireEvent.change(searchInput, { target: { value: 'XYZ123NonExistent' } });
    
    expect(screen.getByText(/No terms found matching "XYZ123NonExistent"/i)).toBeInTheDocument();
    
    // Search for a specific term (assuming "EVM" exists)
    fireEvent.change(searchInput, { target: { value: 'EVM' } });
    expect(screen.queryByText(/No terms found matching/i)).not.toBeInTheDocument();
  });
});
