import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect as vitestExpect } from 'vitest';
import { EligibilityCard } from '@/components/EligibilityCard';
import { DeadlineCard } from '@/components/DeadlineCard';
import { CtaButton } from '@/components/CtaButton';
import { electionData } from '@/data/electionData';

vitestExpect.extend(toHaveNoViolations);

describe('Accessibility tests', () => {
  const mockState = electionData['DL'];

  it('EligibilityCard should have no accessibility violations', async () => {
    const { container } = render(<EligibilityCard stateData={mockState} />);
    const results = await axe(container);
    vitestExpect(results).toHaveNoViolations();
  });

  it('DeadlineCard should have no accessibility violations', async () => {
    const { container } = render(<DeadlineCard stateData={mockState} />);
    const results = await axe(container);
    vitestExpect(results).toHaveNoViolations();
  });

  it('CtaButton should have no accessibility violations', async () => {
    const { container } = render(<CtaButton url="https://voters.eci.gov.in" />);
    const results = await axe(container);
    vitestExpect(results).toHaveNoViolations();
  });
});
